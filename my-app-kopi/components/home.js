import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importer Ionicons fra expo-pakken

// Home-komponenten viser en velkomsttekst og knapper til de forskellige skærme
export default function Home({ navigation }) { // navigation er en prop, der giver adgang til navigation
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://img.icons8.com/?size=100&id=1zf5ffn5HyB8&format=png&color=000000' }}
                style={styles.logo}
            />
            <Text style={styles.welcomeText}>ChoreSum!</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Chore List')}>
                <Ionicons name="list-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>See chore list</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('People')}>
                <Ionicons name="people-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>People</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Calendar')}>
                <Ionicons name="calendar-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings')}>
                <Ionicons name="settings-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Settings</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FDEDEC',
        padding: 20,
    },
    logo: {
        width: 50,
        height: 50,
        marginBottom: 30,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        fontWeight: 'bold', 
    },
    button: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgb(173, 216, 230)',
        paddingVertical: 20, // Ens højde på alle knapper
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
