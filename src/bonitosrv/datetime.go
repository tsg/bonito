package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"time"
)

// Layout for timestamps when talking to JS.
const JsTsLayout = "2006-01-02T15:04:05.000Z"

type JsTime time.Time

// MarshalJSON implements json.Marshaler interface.
// The time is a quoted string in the JsTsLayout format.
func (t JsTime) MarshalJSON() ([]byte, error) {
	return json.Marshal(time.Time(t).UTC().Format(JsTsLayout))
}

// UnmarshalJSON implements js.Unmarshaler interface.
// The time is expected to be a quoted string in JsTsLayout
// or a quoted relative time specification ready to be
// passed to ParseTime.
func (t *JsTime) UnmarshalJSON(data []byte) (err error) {
	if data[0] != []byte(`"`)[0] || data[len(data)-1] != []byte(`"`)[0] {
		return errors.New("Not quoted")
	}
	*t, err = ParseJsTime(string(data[1 : len(data)-1]))
	return
}

// Timerange can be used for specifying time intervals.
type Timerange struct {
	From JsTime `json:"from"`
	To   JsTime `json:"to"`
}

// Implement the Stringer interface.
func (t Timerange) String() string {
	return fmt.Sprintf("{from: %v, to: %v}", time.Time(t.From).UTC(), time.Time(t.To).UTC())
}

// IsZero() returns true if either From or To are zero according
// to time.Time.IsZero().
func (tr Timerange) IsZero() bool {
	return time.Time(tr.From).IsZero() || time.Time(tr.To).IsZero()
}

// Round down the given time to the second, minute, hour, day, week, etc.
func truncateTime(dt time.Time, spec string) time.Time {
	switch spec {
	case "/s":
		return dt.Truncate(time.Second)
	case "/m":
		return dt.Truncate(time.Minute)
	case "/h":
		return dt.Truncate(time.Hour)
	case "/d":
		return time.Date(dt.Year(), dt.Month(), dt.Day(), 0, 0, 0, 0, dt.Location())
	case "/w":
		return dt.UTC().Truncate(7 * 24 * time.Hour).In(dt.Location())
	case "/M":
		return time.Date(dt.Year(), dt.Month(), 1, 0, 0, 0, 0, dt.Location())
	case "/y":
		return time.Date(dt.Year(), time.January, 1, 0, 0, 0, 0, dt.Location())
	default:
		panic(fmt.Errorf("Unknwon spec %s", spec))
	}
}

// Time arithmetic helper function.
func timeAdd(dt time.Time, value int, spec string) time.Time {
	switch spec {
	case "":
		return dt
	case "s":
		return dt.Add(time.Duration(value) * time.Second)
	case "m":
		return dt.Add(time.Duration(value) * time.Minute)
	case "h":
		return dt.Add(time.Duration(value) * time.Hour)
	case "d":
		return dt.AddDate(0, 0, value)
	case "w":
		return dt.AddDate(0, 0, 7*value)
	case "M":
		return dt.AddDate(0, value, 0)
	case "y":
		return dt.AddDate(value, 0, 0)
	default:
		panic(errors.New("Unexpected time specifier"))
	}
}

// ParseTime accepts both absolute times respecting the JsTsLayout
// and relative times to the current server time. Examples:
//
//  * now-1h
//  * now+1h
//  * now-12m
func ParseTime(timespec string) (time.Time, error) {
	var re = regexp.MustCompile("^now([-+][0-9]+)?([smhdwMy])?(/[smhdwMy])?$")
	if re.MatchString(timespec) {
		matches := re.FindStringSubmatch(timespec)

		var value int
		if matches[1] == "" && matches[2] != "" || matches[1] != "" && matches[2] == "" {
			return time.Time{}, fmt.Errorf("Failed to parse spec")
		}

		if matches[1] != "" {
			var err error
			value, err = strconv.Atoi(matches[1])
			if err != nil {
				return time.Time{}, fmt.Errorf("Failed to parse spec: %v", err)
			}
		}

		dt := timeAdd(time.Now(), value, matches[2])

		if matches[3] != "" {
			dt = truncateTime(dt, matches[3])
		}

		return dt, nil
	} else {
		return time.Parse(JsTsLayout, timespec)
	}
}

// MustParseTime is a convenience equivalent of the ParseTime function
// that panics in case of errors.
func MustParseTime(timespec string) time.Time {
	ts, err := ParseTime(timespec)
	if err != nil {
		panic(err)
	}
	return ts
}

// ParseJsTime is equivalent to ParseTime but returns a JsTime instead
// of a time.Time.
func ParseJsTime(timespec string) (jsts JsTime, err error) {
	ts, err := ParseTime(timespec)
	jsts = JsTime(ts)
	return
}

// MustParseJsTime is a convenience equivalent of ParseJsTime function
// that panics in case of errors.
func MustParseJsTime(timespec string) JsTime {
	jsts, err := ParseJsTime(timespec)
	if err != nil {
		panic(err)
	}
	return jsts
}
