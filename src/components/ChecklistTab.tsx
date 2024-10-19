import React, {useContext} from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {List} from '@ui-kitten/components';
import {observer} from 'mobx-react-lite';
import {MSTContext} from '../mst';
import ChecklistEntryCard from './ChecklistEntryCard';
import NoData from './NoData';
import {ChecklistEntryType} from '../types/ChecklistEntry';

interface ChecklistTabProps {
  type: string;
  navigation: any;
}

const ChecklistTab = observer<ChecklistTabProps>(({type, navigation}) => {
  const store = useContext(MSTContext);

  // Filter checklist entries based on type
  const filteredData = store.checklistEntries.filter(
    item => item.type === type,
  );

  const renderItem = (item: ChecklistEntryType) => (
    <ChecklistEntryCard
      title={item.desc}
      isCompleted={item.isCompleted ? 1 : 0}
      createdAt={item.createdAt}
      onPress={() => navigateToDetail(item._id)}
      key={item._id}
    />
  );

  const navigateToDetail = (id: string) => {
    navigation.navigate('ChecklistEntryDetail', {id, type});
  };

  const navigateToAddNew = () => {
    navigation.navigate('ChecklistEntrySingle', {type});
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={navigateToAddNew}>
        <Text style={styles.addButtonText}>Add New {type} Goal</Text>
      </TouchableOpacity>
      <List
        style={styles.list}
        data={filteredData}
        renderItem={({item}) => renderItem(item as ChecklistEntryType)}
        ListEmptyComponent={
          <NoData title={`Add a new ${type} checklist by pressing + button`} />
        }
      />
    </View>
  );
});

export default ChecklistTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
});
