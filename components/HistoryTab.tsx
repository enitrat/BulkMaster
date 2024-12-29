import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { Workout, Exercise } from '../types';
import ExerciseHistoryList from './ExerciseHistoryList';

type HistoryView = 'calendar' | 'exercises';

type HistoryTabProps = {
  workouts: Workout[];
  exercises: Exercise[];
  historyView: HistoryView;
  setHistoryView: (view: HistoryView) => void;
};

export default function HistoryTab({ workouts, exercises, historyView, setHistoryView }: HistoryTabProps) {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  const markedDates = useMemo(() => {
    const dates: { [key: string]: { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string } } = {};
    workouts.forEach(workout => {
      const dateStr = new Date(workout.date).toISOString().split('T')[0];
      dates[dateStr] = {
        marked: true,
        dotColor: '#007AFF',
      };
    });
    if (selectedDate) {
      dates[selectedDate] = {
        ...(dates[selectedDate] || {}),
        selected: true,
        selectedColor: '#007AFF',
      };
    }
    return dates;
  }, [workouts, selectedDate]);

  const selectedDateWorkouts = useMemo(() => {
    if (!selectedDate) return [];
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date).toISOString().split('T')[0];
      return workoutDate === selectedDate;
    });
  }, [workouts, selectedDate]);

  const renderHistoryContent = () => {
    if (historyView === 'calendar') {
      return (
        <ScrollView style={styles.historyContainer} bounces={false}>
          <Calendar
            markedDates={markedDates}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            theme={{
              todayTextColor: '#007AFF',
              selectedDayBackgroundColor: '#007AFF',
              dotColor: '#007AFF',
            }}
          />
          {selectedDate && (
            <View style={styles.selectedDateWorkouts}>
              <Text style={styles.dateHeader}>
                Workouts on {new Date(selectedDate).toLocaleDateString()}
              </Text>
              {selectedDateWorkouts.map((workout, index) => (
                <View key={index} style={styles.workoutSummary}>
                  <Text style={styles.workoutTime}>
                    {new Date(workout.date).toLocaleTimeString()}
                  </Text>
                  {workout.exercises.map((exercise, i) => (
                    <Text key={i} style={styles.exerciseSummary}>
                      • {exercise.exercise.name}: {exercise.sets.length} sets
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      );
    } else {
      return <ExerciseHistoryList exercises={exercises} workouts={workouts} />;
    }
  };

  return (
    <View style={styles.content}>
      <View style={styles.historyViewToggle}>
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            historyView === 'calendar' && styles.activeViewToggleButton,
          ]}
          onPress={() => setHistoryView('calendar')}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={historyView === 'calendar' ? '#007AFF' : '#666'}
          />
          <Text
            style={[
              styles.viewToggleText,
              historyView === 'calendar' && styles.activeViewToggleText,
            ]}
          >
            Calendar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewToggleButton,
            historyView === 'exercises' && styles.activeViewToggleButton,
          ]}
          onPress={() => setHistoryView('exercises')}
        >
          <Ionicons
            name="trending-up"
            size={20}
            color={historyView === 'exercises' ? '#007AFF' : '#666'}
          />
          <Text
            style={[
              styles.viewToggleText,
              historyView === 'exercises' && styles.activeViewToggleText,
            ]}
          >
            Exercise History
          </Text>
        </TouchableOpacity>
      </View>
      {renderHistoryContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  historyViewToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
    borderRadius: 6,
  },
  activeViewToggleButton: {
    backgroundColor: '#f0f0f0',
  },
  viewToggleText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeViewToggleText: {
    color: '#007AFF',
  },
  historyContainer: {
    flex: 1,
  },
  selectedDateWorkouts: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  workoutSummary: {
    marginBottom: 16,
  },
  workoutTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  exerciseSummary: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
  },
});
