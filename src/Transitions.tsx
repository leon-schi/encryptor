const flowTransition = (transitionInfo: any) => {
    const { progress, start, end } = transitionInfo;
    const y = progress.interpolate({
      inputRange: [start, end],
      outputRange: [100, 0],
    });
    const opacity = progress.interpolate({
        inputRange: [start, end],
        outputRange: [0, 1],
      });
    return { transform: [{ translateY: y }], opacity: opacity };
}

const fadeTransition = (transitionInfo: any) => {
    const { progress, start, end } = transitionInfo;
    const opacity = progress.interpolate({
        inputRange: [start, end],
        outputRange: [0, 1],
      });
    return { opacity: opacity };
}

const noneTransition = (transitionInfo: any) => {
  return {};
}

export {flowTransition, fadeTransition, noneTransition};