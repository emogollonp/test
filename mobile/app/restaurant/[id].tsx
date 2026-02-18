import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <Link href="/" style={styles.backLink}>
                    <Text style={styles.backLinkText}>← Back to list</Text>
                </Link>

                <Text style={styles.title}>Restaurant Detail</Text>
                <Text style={styles.subtitle}>ID: {id}</Text>

                <View style={styles.card}>
                    <Text style={styles.cardText}>
                        Restaurant details will be implemented here.
                    </Text>
                </View>
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
    backLink: {
        marginTop: 20,
        marginBottom: 20,
    },
    backLinkText: {
        fontSize: 16,
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
    },
    cardText: {
        fontSize: 16,
        color: '#666',
    },
});
