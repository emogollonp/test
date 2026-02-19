import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Schedule, DayOfWeek } from '../../api/types';

interface RestaurantScheduleProps {
    schedule: Schedule;
    timezone: string;
}

/**
 * Restaurant Schedule Component
 *
 * Displays weekly schedule with:
 * - Current day highlighted
 * - Closed days marked
 * - Timezone display
 * - 12-hour time format
 */
export const RestaurantSchedule = React.memo<RestaurantScheduleProps>(({ schedule, timezone }) => {
    const today = new Date()
        .toLocaleDateString('en-US', {
            weekday: 'long',
            timeZone: timezone,
        })
        .toLowerCase() as DayOfWeek;

    const days: DayOfWeek[] = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
    ];

    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Opening Hours</Text>
                <Text style={styles.timezone}>{timezone}</Text>
            </View>

            <View style={styles.scheduleList}>
                {days.map((day) => {
                    const daySchedule = schedule[day];
                    const isToday = day === today;

                    return (
                        <View key={day} style={[styles.dayRow, isToday && styles.dayRowToday]}>
                            <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                            </Text>
                            {daySchedule.closed ? (
                                <Text
                                    style={[
                                        styles.dayTime,
                                        styles.dayClosed,
                                        isToday && styles.dayTimeToday,
                                    ]}
                                >
                                    Closed
                                </Text>
                            ) : (
                                <Text style={[styles.dayTime, isToday && styles.dayTimeToday]}>
                                    {formatTime(daySchedule.open)} - {formatTime(daySchedule.close)}
                                </Text>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
});

RestaurantSchedule.displayName = 'RestaurantSchedule';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    timezone: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    scheduleList: {
        gap: 12,
    },
    dayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    dayRowToday: {
        backgroundColor: '#007AFF15',
    },
    dayName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#666',
        textTransform: 'capitalize',
        width: 100,
    },
    dayNameToday: {
        color: '#007AFF',
        fontWeight: '700',
    },
    dayTime: {
        fontSize: 15,
        color: '#333',
        fontWeight: '400',
    },
    dayTimeToday: {
        color: '#007AFF',
        fontWeight: '600',
    },
    dayClosed: {
        color: '#999',
        fontStyle: 'italic',
    },
});
