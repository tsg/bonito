package main

import (
	"fmt"
	"regexp"
	"strconv"
	"time"
)

// Layout for timestamps when talking to JS.
const TsLayout = "2006-01-02T15:04:05.000Z"

// ParseTime accepts both absolute times respecting the TsLayout
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
		return time.Parse(TsLayout, timespec)
	}
}
