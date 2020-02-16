import React, { Component } from 'react';
import { 
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class Animator extends Component{
  constructor(props){
    super(props);
    
    this.position = new Animated.ValueXY(this.props.currentPosition);

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderRelease
    });
  }

  render() {
    return (
      <Animated.View 
        style={[
          {...this.position.getLayout(), left: 0},
          StyleSheet.flatten([
            styles.animationContainer(this.props.containerHeight, this.props.backgroundColor),
            styles.roundedEdges(this.props.roundedEdges),
            styles.shadow(this.props.shadow)
          ])
        ]}
        {...this._panResponder.panHandlers}
      >
        {this.props.children}
      </Animated.View>
    )
  }

  _handlePanResponderMove = (e, gesture) => {
    const newYPosition = this.props.currentPosition.y + gesture.dy;
    if(newYPosition > this.props.downPosition.y) return;
    if (this._swipeInBounds(gesture)) {
      this.position.setValue({ y: this.props.currentPosition.y + gesture.dy });
    } else {
      this.position.setValue({ y: this.props.upPosition.y - this._calculateEase(gesture) });
    }
  }

  _handlePanResponderRelease = (e, gesture) => {
    console.log(gesture.dy < -this.props.toggleThreshold && this.props.currentPosition === this.props.downPosition)
    console.log("Gesture DY:", gesture.dy);
    console.log("Toggle threshold: ", -this.props.toggleThreshold)
    console.log("Current pos: ", this.props.currentPosition)
    console.log("Down Pos: ", this.props.downPosition)
    if (gesture.dy > this.props.toggleThreshold && this.props.currentPosition === this.props.upPosition) {
      this._transitionTo(this.props.downPosition, this.props.onCollapsed);
    } else if (gesture.dy < -this.props.toggleThreshold && this.props.currentPosition === this.props.downPosition) {

      this._transitionTo(this.props.upPosition, this.props.onExpanded);
    } else {
      this._resetPosition();
    }
  }

  // returns true if the swipe is within the height of the drawer.
  _swipeInBounds(gesture) {
    return this.props.currentPosition.y + gesture.dy > this.props.upPosition.y;
  }

  _calculateEase(gesture) {
    return Math.min(Math.sqrt(gesture.dy * -1), Math.sqrt(SCREEN_HEIGHT));
  }

  _transitionTo(position, callback) {

    if(position === this.props.currentPosition) return;
    Animated.spring(this.position, {
      toValue: position
    }).start(() => this.props.onExpanded());
    this.props.setCurrentPosition(position);
    callback();
  }

  _resetPosition() {
    Animated.spring(this.position, {
      toValue: this.props.currentPosition
    }).start();

  }
}

const styles = {
  animationContainer: (height, color) => ({
    width: SCREEN_WIDTH,
    position: 'absolute',
    height: height + Math.sqrt(SCREEN_HEIGHT),
    backgroundColor: color,
  }),
  roundedEdges: rounded => {
    return rounded == true && {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    }
  },
  shadow: shadow => {
    return shadow == true && {
      shadowColor: '#CECDCD',
      shadowRadius: 3,
      shadowOpacity: 5,
    }
  },
}
