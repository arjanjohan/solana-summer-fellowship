import { StyleSheet, View, Image } from "react-native";
import { Text, Button } from "react-native-paper";
import React, { useState, useEffect } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import Geolocation from '@react-native-community/geolocation';
import { requestPermissions } from '../utils/requestPermissions';
// import { create } from 'ipfs-http-client'; // this breaks upon initialize
// import { RNCamera } from 'react-native-camera'; // this breaks the build

import { useAuthorization } from "../utils/useAuthorization";

export default function NftScreen() {
  const { selectedAccount } = useAuthorization();
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  // Initialize IPFS client
  // const ipfs = create({
  //   host: 'ipfs.infura.io',
  //   port: 5001,
  //   protocol: 'https'
  // });

  useEffect(() => {
    // Request permissions when component mounts
    requestPermissions();
    // Request location when component mounts
    // Geolocation.getCurrentPosition(
    //   (position) => {
    //     console.log("Position: ", position);
    //     // const { latitude, longitude } = position.coords;
    //     // setLatitude(latitude);
    //     // setLongitude(longitude);
    //   },
    //   (error) => {
    //     console.error("Error getting location", error);
    //   },
    //   { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    // );
  }, []);
  
  const selectPhoto = async () => {
    const photo = await launchImageLibrary({
      selectionLimit: 1,
      mediaType: 'photo',
    });
    const selectedPhoto = photo?.assets?.[0];
    if (!selectedPhoto?.uri) {
      console.warn('Selected photo not found');
      return;
    }
    setImagePath(selectedPhoto.uri);
  };


  const createNft = async () => {
    try {
      // Read the image file and get the base64 string.
      const imageBytesInBase64: string = await RNFetchBlob.fs.readFile(
        imagePath!,
        'base64',
      );

      // Convert base64 into a Buffer (raw bytes).
      const bytes = Buffer.from(imageBytesInBase64, 'base64');

      // Upload the image to IPFS
      // const result = await ipfs.add(bytes);
      // console.log('IPFS CID:', result.path);

      // let description = 'A sample NFT'; // You can customize this description
      // const metadata = JSON.stringify({
      //   name: "Sample NFT",
      //   description,
      //   image: `https://ipfs.io/ipfs/${result.path}`,
      // });

      // // Upload metadata to IPFS
      // const metadataResult = await ipfs.add(metadata);
      // console.log('Metadata IPFS CID:', metadataResult.path);
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
    }
  };
  return (
    <View style={styles.screenContainer}>
      <Text variant="titleLarge">Mint your photo as an NFT!</Text>
      <Button
        mode="contained"
        onPress={selectPhoto}
        style={styles.uploadButton}
      >
        Upload Image
      </Button>

      {imagePath && (
        <>
          <Image
            source={{ uri: imagePath }}
            style={styles.thumbnail}
            resizeMode="contain"
          />
          <Button
            mode="contained"
            onPress={createNft}
            style={styles.createButton}
          >
            Create NFT
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    height: "100%",
    padding: 16,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',    // Center content horizontally
  },
  uploadButton: {
    marginTop: 16,
  },
  thumbnail: {
    width: 200,
    height: 200,
    marginTop: 16,
  },
  createButton: {
    marginTop: 16,
  },
});
