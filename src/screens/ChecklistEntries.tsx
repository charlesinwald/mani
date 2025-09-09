import React, {useContext, useState, useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {observer} from 'mobx-react-lite';
import GestureRecognizer from 'react-native-swipe-gestures';

import {MSTContext} from '../mst';

import {ChecklistEntriesProps} from '../navigation/types';
import {Layout} from '../components/Layout';
import ChecklistTab from '../components/ChecklistTab';
import {TouchableOpacity} from 'react-native-gesture-handler';

const ChecklistEntries: React.FC<ChecklistEntriesProps> = observer(
  ({navigation}) => {
    const store = useContext(MSTContext);
    console.log(JSON.stringify(store.checklistEntries));
    const [currentTab, setCurrentTab] = useState(0);
    const tabs = ['Short Term', 'Long Term', 'Lifetime'];

    const onSwipeLeft = () => {
      if (currentTab < tabs.length - 1) {
        setCurrentTab(currentTab + 1);
      }
    };

    const onSwipeRight = () => {
      if (currentTab > 0) {
        setCurrentTab(currentTab - 1);
      }
    };

    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };

    return (
      <Layout>
        <View style={styles.tabBar}>
          {tabs.map((tab, index) => (
            <TouchableOpacity onPress={() => setCurrentTab(index)} key={index}>
              <Text
                key={index}
                style={[
                  styles.tabText,
                  currentTab === index && styles.activeTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <GestureRecognizer
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
          config={config}
          style={styles.gestureContainer}>
          <ChecklistTab
            type={tabs[currentTab].toLowerCase().replace(' ', '')}
            navigation={navigation}
          />
        </GestureRecognizer>
      </Layout>
    );
  },
);

export default ChecklistEntries;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  gestureContainer: {
    flex: 1,
    marginBottom: 100,
  },
});
