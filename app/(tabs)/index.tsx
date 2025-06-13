import { Ionicons } from '@expo/vector-icons'; // Using Expo Icons for vector graphics
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const trips = [
  { id: 'paris', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBf-aecAV1D2_R9kdo1HWmXq3ZZhccw1V6t13yBbd_icdIgaPd-nrpAFfcACnRrKVGaQKyIdOmTjzaj2Psj6w_rz6OgZcQ3Aaab3D1-03N459zC7wXU3ts7rm3c_Ztmrd_oCxPnw7fkQ4T8I5Z5s1TZ61JpxW14BUZj8HJFdqxaG583gooqSbp31iY9UmXBxp9Zx6ogxmNJxU8P2a2zWhpXbNrpdEKY3a-892TvRC5izeI1iW33BtC6Uypheikbvz4o7tVk3lFZVPw', name: 'Paris Getaway', dates: 'Oct 12 - Oct 19' },
  { id: 'mountain', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD872k-RBYoxsMiBN5w13CDnlWnCuhdclvS4v9Nx0T9-PyD6WvJQOxx70QasLAYnk96d5Uoqv7K7bG-RKClxn4zbswsZkDktekdAVdXF8NDYTUnw_9Xdg2WbUmIHNuMqAkFF16bTJzmrBHEFf4RHslJ7jcR4fqm9fdawhUTVHYrNSkDmN30id9ojfw11lMUUz5ojXhlR3IPsTeVB-KLqEMrjOML0FwgGl-krj2jyZoNKv9fqkjFsjgBTF2Q2_Wc3ykZjqzqL1vXqBQ', name: 'Mountain Retreat', dates: 'Nov 5 - Nov 12' },
  { id: 'beach', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSWJx1K9CAKTWYP1j4DWdFV9FhRaSgq8-E71RIpVGtmqNol-mQ4WwnMBa2Q9xXVYC8NZPRHpUkTo_J9DAwmqOo50svAB__oDBMZH-yka9u2Hu9qRawJ3IRG7Q1jrRYRlt0WuPudF13_1cZRA4PuTMy6FKQH7XhGFyx7RK5_vyR36cq3DEasqHnZKywS4Ex8j-1R3qI6SAmaLuPJvHCDGgSuLNTN6u2CB5t7J1JCgmrItHrqp3_K5H-qsNaedbsoHFOlVPHdu9QRlc', name: 'Beach Vacation', dates: 'Dec 20 - Dec 27' },
  { id: 'city', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFVolC-4AacRsfbDM6osCo1AvL5alWAhM5fV-oXEYHpelAC2S7TN11Dhd0Ndd0NJIXIB_lezufxpp0tBNOz3aAPttCcxWGEejGJA50Y_hkH0FP2Ao_DswchTagRZjRtBCe8GXEWarsbBNWzC73vvBWsiZBBVblDV0-CyWabcmYMdg49s76Hn1lVHDvopHddfXE6AyQbZnOtG4P6D3gf9c30wBNgYFI2W3tPHE0kEC5YVKC4DC3m0LUqLOLSkmHFOomi5CmgwcMe88', name: 'City Exploration', dates: 'Jan 8 - Jan 15' },
  { id: 'roadtrip', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD83RakpaIJNYOIowVOy79davWwDOt6Nmn2qz_m_Hzr9HEMqxTR5cJd8ZrZ7Ik88X3Qc_wuG9H1ZJWrIYvsEg5d6ibwuezsyeIHaM2AiF9MZEHDynCrNziVJVtSsizZJB8DbNndMkSqzpHLmBuY3qLCuRWbvGdTPpFSdeACazPFUZ4lgfvLnyyO9AcDaYw1M1Ys3C4OyoMB1QeZUyhmXpzkyKKBkY3m3oiJRbWfdnaB0b4e_ele4LXg49EJlsw_42kmCsYmWmeBgDk', name: 'Family Road Trip', dates: 'Feb 14 - Feb 21' },
  { id: 'adventure', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFVolC-4AacRsfbDM6osCo1AvL5alWAhM5fV-oXEYHpelAC2S7TN11Dhd0Ndd0NJIXIB_lezufxpp0tBNOz3aAPttCcxWGEejGJA50Y_hkH0FP2Ao_DswchTagRZjRtBCe8GXEWarsbBNWzC73vvBWsiZBBVblDV0-CyWabcmYMdg49s76Hn1lVHDvopHddfXE6AyQbZnOtG4P6D3gf9c30wBNgYFI2W3tPHE0kEC5YVKC4DC3m0LUqLOLSkmHFOomi5CmgwcMe88', name: 'Adventure Awaits', dates: 'Mar 3 - Mar 10' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
     
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trips</Text>
        <Pressable style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      
      <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
        {trips.map((trip) => (
          <Pressable
            key={trip.id}
            style={styles.tripItem}
            onPress={() => router.push(`/trip/${trip.id}`)} // Navigate to the trip detail page with the ID
          >
            <Image
              style={styles.tripImage}
              source={{ uri: trip.imageUrl }}
            />
            <View>
              <Text style={styles.tripTitle}>{trip.name}</Text>
              <Text style={styles.tripDates}>{trip.dates}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
     
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111218',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111218',
    padding: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    paddingLeft: 48, 
  },
  addButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 9999, 
    backgroundColor: 'transparent',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
    justifyContent: 'space-between', 
  },
  tripItem: {
    flexDirection: 'column',
    gap: 12,
    paddingBottom: 12,
    width: '48%', 
  },
  tripImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  tripTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  tripDates: {
    color: '#9ba1bb',
    fontSize: 14,
  },
  bottomNavContainer: {
    backgroundColor: '#1b1d27',
  },
});
