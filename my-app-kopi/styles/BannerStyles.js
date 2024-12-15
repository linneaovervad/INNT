import { StyleSheet } from 'react-native';

const BannerStyles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    right: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    zIndex: 10,
  },
  bannerImage: {
    height: '100%',
    width: '100%',
    borderRadius: 5,
  },
});

export default BannerStyles;
