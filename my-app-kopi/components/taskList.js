import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

// Billedskærm til visning af et billede
export default function ImageScreen({ route }) {
    const [image, setImage] = useState(null);

    useEffect(() => {
        // Brug optional chaining og fallback til null, hvis billedet ikke findes
        const imageUri = route.params?.image || null;
        setImage(imageUri);

        return () => {
            setImage(null);
        };

    }, [route.params?.image]); // Lyt på ændringer i billedet


    return (
        <View style={styles.container}>
            {image ? (
                <Image
                    source={{ uri: `data:image/jpeg;base64,${image}` }}
                    style={styles.image} // Vis billedet, hvis det findes
                />
            ) : (
                <View style={styles.whiteScreen} /> // Hvid skærm, hvis billedet ikke findes
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',  // Sikrer, at skærmen altid har en hvid baggrund
    },
    image: {
        width: '100%',  // Brug '100%' for bredde og højde, så billedet fylder hele skærmen
        height: '100%',
        resizeMode: 'cover',
    },
    whiteScreen: {
        flex: 1,
        backgroundColor: 'white',
    },
});
