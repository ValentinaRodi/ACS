import React, { useCallback, memo, useRef, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Dimensions,
  Text,
  StyleSheet,
  Image,
  TouchableHighlight,
} from "react-native";
import uuid from 'react-native-uuid';
import NumericInput from 'react-native-numeric-input';

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  slide: {
    height: windowHeight,
    width: windowWidth,
    justifyContent: "center",
    alignItems: "center",
  },
  slideImage: { width: windowWidth * 0.9, height: windowHeight * 0.3 },
  slideTitle: { fontSize: 24 },
  slideSubtitle: { fontSize: 18 },

  pagination: {
    position: "absolute",
    bottom: 8,
    width: "100%",
    justifyContent: "center",
    flexDirection: "row",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  paginationDotActive: { backgroundColor: "lightblue" },
  paginationDotInactive: { backgroundColor: "gray" },

  container: { flex: 1 },
});

const keyUUID = uuid.v1();

let json = require('./storage/Menu.json');

const data = json.serviceTimes[0].menuCategories;

const Slide = memo(function Slide({ data }) {
  const [price, setPrice] = useState(data.itemPrice);
    
  function getPrice() {
    price = 10
    setPrice(price)
  }

  return (
    <View style={styles.slide} key={keyUUID}>
      <Image source={{ uri: `https://smartapp.acs-cis.ru/assets/img/Menu/${data.url}` }} style={styles.slideImage}></Image>
      <Text style={styles.title}>{data.itemName}</Text>
      <Text style={styles.title}>{data.itemDescription}</Text>
      <Text style={styles.title}>{data.itemWeight}</Text>
      <NumericInput 
        value={price} 
        step={price*2}
        onChange={getPrice} 
        totalWidth={240} 
        totalHeight={50} 
        iconSize={25}
        valueType='real'
        rounded 
        textColor='#B0228C' 
        iconStyle={{ color: 'white' }} 
        rightButtonBackgroundColor='#EA3788' 
        leftButtonBackgroundColor='#E56B70'/>
    </View>
  );
});

function Pagination({ index, slideList }) {
  
  return (
    <View key={keyUUID} style={styles.pagination} pointerEvents="none">
      {slideList.map((_, i) => {
        return (
          <View
            key={keyUUID}
            style={[
              styles.paginationDot,
              index === i
                ? styles.paginationDotActive
                : styles.paginationDotInactive,
            ]}
          />
        );
      })}
    </View>
  );
}

export default function Carousel() {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  indexRef.current = index;
  const onScroll = useCallback((event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);

    const distance = Math.abs(roundIndex - index);

    const isNoMansLand = 0.4 < distance;

    if (roundIndex !== indexRef.current && !isNoMansLand) {
      setIndex(roundIndex);
    }
  }, []);

  const flatListOptimizationProps = {
    initialNumToRender: 0,
    maxToRenderPerBatch: 1,
    removeClippedSubviews: true,
    scrollEventThrottle: 16,
    windowSize: 2,
    keyExtractor: useCallback((s) => String(s.id), []),
    getItemLayout: useCallback(
      (_, index) => ({
        index,
        length: windowWidth,
        offset: index * windowWidth,
      }),
      []
    ),
  };

  const renderItem = useCallback(function renderItem({ item, index }) {
    return ( <TouchableHighlight>
        <Slide data={item}/>
      </TouchableHighlight>
    )  
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        renderItem={({item}) =>
          <View key={keyUUID}>
            <Text>{item.catName}</Text>
            <FlatList
              data={item.menuItems}
              renderItem={renderItem}
              keyExtractor={({id}, index) => index}
              pagingEnabled
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              onScroll={onScroll}
              {...flatListOptimizationProps}
            />
            <Pagination index={index} slideList={item.menuItems}></Pagination> 
          </View>
        }
      />
    </SafeAreaView>
  );
}
