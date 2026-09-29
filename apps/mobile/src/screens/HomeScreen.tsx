import { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native';
import { useQuery } from 'react-query';
import api from '../services/api';
import { PropertyType, PropertyStatus } from '../types/enums';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../theme/brand';
import logo from '../assets/logo.png';


interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  price: number;
  monthlyRent: number;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  maxOccupancy: number;
  amenities: string[];
  status: PropertyStatus;
  images: { url: string; isPrimary: boolean }[];
  reviews: { rating: number }[];
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

interface PaginatedResponse {
  data: Property[];
  total: number;
  page: number;
  limit: number;
}

const filters = [
  { id: 'all', label: 'All' },
  { id: 'APARTMENT', label: 'Apartments' },
  { id: 'HOUSE', label: 'Houses' },
  { id: 'STUDIO', label: 'Studios' },
  { id: 'DORM', label: 'Dorms' },
];

export default function HomeScreen() {
  const navigation = useNavigation() as any;
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    [
      'properties',
      { propertyType: activeFilter !== 'all' ? activeFilter : undefined, city: searchLocation },
    ],
    () =>
      api
        .get('/properties', {
          params: {
            propertyType: activeFilter !== 'all' ? activeFilter : undefined,
            city: searchLocation || undefined,
            limit: 20,
          },
        })
        .then((res) => res.data.data as PaginatedResponse),
    { staleTime: 30000 }
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderProperty = ({ item }: { item: Property }) => {
    const primaryImage = item.images.find((img) => img.isPrimary) || item.images[0];
    const avgRating = item.reviews.length
      ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
      : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
      >
        {primaryImage ? (
          <Image source={{ uri: primaryImage.url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="image" size={40} color={colors.textSubtle} />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.propertyTitle}>{item.title}</Text>
          <Text style={styles.location}>
            {item.city}, {item.state}
          </Text>
          <Text style={styles.price}>${item.monthlyRent}/mo</Text>
          <View style={styles.details}>
            <Text>{item.bedrooms} bed</Text>
            <Text> • </Text>
            <Text>{item.bathrooms} bath</Text>
            <Text> • </Text>
            <Text>{item.maxOccupancy} max</Text>
          </View>
          {avgRating > 0 && (
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={colors.accent} />
              <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}> ({item.reviews.length})</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
        <TouchableOpacity onPress={() => navigation.navigate('SavedTab' as never)}>
          <Ionicons name="bookmark-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSubtle} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by city or university..."
          value={searchLocation}
          onChangeText={setSearchLocation}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={filters}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === item.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(item.id)}
            >
              <Text style={[styles.filterText, activeFilter === item.id && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text>Loading properties...</Text>
        </View>
      ) : (
        <FlatList
          data={data?.data || []}
          keyExtractor={(item) => item.id}
          renderItem={renderProperty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
    headerLogo: { width: 110, height: 78 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    fontFamily: fonts.regular,
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  filterContainer: { paddingHorizontal: 20, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: colors.primary },
    filterText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
    filterTextActive: { fontFamily: fonts.regular, color: colors.white, fontWeight: '600' },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 160 },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },
  cardContent: { padding: 16 },
    propertyTitle: { fontFamily: fonts.regular, fontSize: 16, fontWeight: 'bold', color: colors.text },
    location: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
    price: { fontFamily: fonts.regular, fontSize: 18, fontWeight: 'bold', color: colors.primary, marginTop: 4 },
  details: { flexDirection: 'row', marginTop: 8, fontSize: 13, color: colors.textMuted },
  rating: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    ratingText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginLeft: 2 },
    reviewCount: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSubtle },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
