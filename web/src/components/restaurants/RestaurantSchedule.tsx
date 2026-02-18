import * as React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DaySchedule {
    open: string;
    close: string;
    closed?: boolean;
}

interface Schedule {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}

interface RestaurantScheduleProps {
    schedule: Schedule;
    timezone: string;
    className?: string;
}

const DAYS_OF_WEEK = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
] as const;

const DAY_LABELS: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
};

export const RestaurantSchedule: React.FC<RestaurantScheduleProps> = ({
    schedule,
    timezone,
    className,
}) => {
    const today = React.useMemo(() => {
        const now = new Date();
        const dayIndex = now.getDay();
        return DAYS_OF_WEEK[(dayIndex + 6) % 7];
    }, []);

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Opening Hours
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                        {timezone}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {DAYS_OF_WEEK.map((day) => {
                        const daySchedule = schedule[day];
                        const isToday = day === today;
                        const isClosed = daySchedule.closed || !daySchedule.open;

                        return (
                            <div
                                key={day}
                                className={`flex justify-between items-center py-2 px-3 rounded-md transition-colors ${
                                    isToday ? 'bg-primary/10 font-medium' : 'hover:bg-muted/50'
                                }`}
                            >
                                <span className={`capitalize ${isToday ? 'font-semibold' : ''}`}>
                                    {DAY_LABELS[day]}
                                    {isToday && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-2 text-xs py-0 px-2"
                                        >
                                            Today
                                        </Badge>
                                    )}
                                </span>
                                <span className={isClosed ? 'text-muted-foreground' : ''}>
                                    {isClosed ? (
                                        'Closed'
                                    ) : (
                                        <>
                                            {daySchedule.open} - {daySchedule.close}
                                        </>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Timezone note */}
                <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                        All times are shown in {timezone} timezone.
                        {/* In production, show user's local time:
                        "Your local time: {convertedTime}"
                    */}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export function isRestaurantOpenNow(schedule: Schedule, timezone: string): boolean {
    console.log(timezone);

    const now = new Date();
    const dayIndex = now.getDay();
    const currentDay = DAYS_OF_WEEK[(dayIndex + 6) % 7];
    const daySchedule = schedule[currentDay];

    if (daySchedule.closed || !daySchedule.open) return false;

    const currentTime = now.toTimeString().substring(0, 5);
    return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
}
