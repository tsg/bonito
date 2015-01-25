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
	return time.Time(tr.From).IsZero() || time.Time(tr.From).IsZero()
}

// ParseTime accepts both absolute times respecting the JsTsLayout
// and relative times to the current server time. Examples:
//
//  * now-1h
//  * now+1h
//  * now-12m
func ParseTime(timespec string) (time.Time, error) {
	var re = regexp.MustCompile("^now([-+][0-9]+)([smhdwMy])$")
	switch {
	case timespec == "now":
		return time.Now(), nil
	case re.MatchString(timespec):
		matches := re.FindStringSubmatch(timespec)

		value, err := strconv.Atoi(matches[1])
		if err != nil {
			return time.Time{}, fmt.Errorf("Failed to parse spec: %v", err)
		}

		switch matches[2] {
		case "s":
			return time.Now().Add(time.Duration(value) * time.Second), nil
		case "m":
			return time.Now().Add(time.Duration(value) * time.Minute), nil
		case "h":
			return time.Now().Add(time.Duration(value) * time.Hour), nil
		case "d":
			return time.Now().AddDate(0, 0, value), nil
		case "w":
			return time.Now().AddDate(0, 0, 7*value), nil
		case "M":
			return time.Now().AddDate(0, value, 0), nil
		case "y":
			return time.Now().AddDate(value, 0, 0), nil
		default:
			panic("Unexpected time specifier")
		}
	default:
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
