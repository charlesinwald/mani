import React from 'react';
import {StyleSheet, View, Pressable, GestureResponderEvent} from 'react-native';
import {Text} from '@ui-kitten/components';
import dayjs from 'dayjs';

interface EntryCardProps {
  desc: string;
  date: string;
  onPress?: ((event: GestureResponderEvent) => void) | null | undefined;
  mood?: string;
}

const EntryCard: React.FC<EntryCardProps> = ({desc, date, onPress, mood}) => {
  const day = dayjs(date).format('DD');
  const rest = `${dayjs(date).format('MMM')} ${dayjs(date)
    .format('YYYY')
    .toString()
    .substr(-2)}`;

  // Function to get the color of the dot based on mood
  const getMoodColor = (mood: string | undefined) => {
    switch (mood) {
      case 'sad':
        return '#FF3D71'; // Red color for 'sad' mood
      case 'neutral':
        return '#FFCA28'; // Yellow color for 'neutral' mood
      case 'happy':
        return '#4CAF50'; // Green color for 'happy' mood
      default:
        return '#CCCCCC'; // Gray for undefined or neutral mood
    }
  };

  return (
    <Pressable style={styles.listItem} onPress={onPress}>
      <View style={styles.listItemInner}>
        <View style={styles.dateWrp}>
          <Text style={styles.day}>{day} </Text>
          <Text style={styles.date}>{rest}</Text>
        </View>
        <Text style={styles.desc}>{desc.substr(0, 20)}</Text>

        {/* Mood Dot */}
        <View
          style={[
            styles.moodDot,
            {backgroundColor: getMoodColor(mood)}, // Dynamically set the dot color based on mood
          ]}
        />
      </View>
    </Pressable>
  );
};

export default EntryCard;

const styles = StyleSheet.create({
  listItem: {
    marginBottom: 10,
  },
  listItemInner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateWrp: {
    marginBottom: 3,
    alignItems: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#ccc',
    paddingRight: 8,
    width: 50,
  },
  day: {
    fontSize: 12,
    color: '#333333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  date: {
    fontSize: 8,
    color: '#333333',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  desc: {
    fontSize: 15,
    color: '#333333',
    paddingLeft: 8,
    flex: 1,
    maxHeight: 40,
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
});
