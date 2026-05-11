package domain

type ReadinessForConsuption int

const (
	ReadinessReadyToEat ReadinessForConsuption = iota
	ReadinessSemiFinished
	ReadinessRequiresCooking
)

var readinessForConsuptionName = map[ReadinessForConsuption]string{
	ReadinessReadyToEat:     "ready_to_eat",
	ReadinessSemiFinished:   "semi_finished",
	ReadinessRequiresCooking: "required_cooking",
}

func (rfc ReadinessForConsuption) String() string {
	return readinessForConsuptionName[rfc]
}