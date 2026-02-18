import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <ScrollView style={styles.content}>
                <Text style={styles.title}>Mesa247</Text>
                <Text style={styles.subtitle}>Discover Restaurants</Text>

                <View style={styles.card}>
                    <Text style={styles.cardText}>Restaurant list will be implemented here.</Text>
                </View>

                <Link href="/restaurant/1" style={styles.link}>
                    <Text style={styles.linkText}>→ Go to restaurant detail (example)</Text>
                </Link>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        color: '#666',
    },
    card: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    cardText: {
        fontSize: 16,
        color: '#666',
    },
    link: {
        marginTop: 10,
    },
    linkText: {
        fontSize: 16,
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
});
