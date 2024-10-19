import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {Card} from '@ui-kitten/components';
import CheckBox from 'react-native-checkbox';

interface ChecklistEntryCardProps {
  title: string;
  createdAt: number;
  isCompleted: number;
  onPress: () => void;
  onToggleCompletion: () => void; // New prop for toggling completion
}

const ChecklistEntryCard: React.FC<ChecklistEntryCardProps> = ({
  title,
  isCompleted,
  onPress,
  createdAt,
  onToggleCompletion,
  ...props
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity onPress={()=> onPress()} {...props}>
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <View style={styles.progressContainer}>
            {/* Replace the text with a checkbox */}
            <CheckBox
              value={isCompleted === 1} // Assuming 1 means completed
              onValueChange={() => {
                onToggleCompletion(); // Call the new function to handle the state change
              }} // Handle checkbox toggle
              label={''}
            />
          </View>
        </View>
        {/* <Icon name="chevron-right" size={24} color="#8F9BB3" /> */}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: '#8F9BB3',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E4E9F2',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3366FF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#8F9BB3',
    minWidth: 40,
    textAlign: 'right',
  },
});

export default ChecklistEntryCard;
