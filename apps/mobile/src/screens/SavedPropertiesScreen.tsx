import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { PropertyType } from '../types/enums';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/brand';

interface Property {
  id: string;
  title: string;
  city: string;
  state: string;
  monthlyRent: number;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  images: { url: string; isPrimary: boolean }[];
  reviews: { rating: number }[];
}

export default function SavedPropertiesScreen() {
  const navigation = useNavigation() as any;
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery(['savedProperties'], () =>
    api.get('/properties/saved').then((res) => res.data.data.properties as Property[]),
  );

  const unsaveMutation = useMutation(
    (propertyId: string) =>
      api.delete(`/properties/${propertyId}/save`).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('savedProperties');
      },
    }
  );

  const handleUnsave = (propertyId: string) => {
    unsaveMutation.mutate(propertyId);
  };

  const handlePropertyPress = (property: Property) => {
    navigation.navigate('PropertyDetail', { id: property.id });
  };

  const renderItem = ({ item }: { item: Property }) => {
    const primaryImage = item.images.find((img) => img.isPrimary) || item.images[0];
    const reviews = item.reviews ?? [];
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return (
      <TouchableOpacity style={styles.card} onPress={() => handlePropertyPress(item)}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage.url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="image" size={32} color={colors.primarySoft} />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.location}>{item.city}, {item.state}</Text>
          <Text style={styles.price}>${item.monthlyRent}/mo</Text>
          {avgRating > 0 && (
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.unsaveButton}
            onPress={() => handleUnsave(item.id)}
          >
            <Ionicons name="bookmark" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved Properties</Text>
      {isLoading ? (
        <View style={styles.center}>
          <Text>Loading saved properties...</Text>
        </View>
      ) : (
        <FlatList
          data={properties || []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>No saved properties yet</Text>
              <Text style={styles.emptySub}>Properties you save will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    header: { fontFamily: fonts.regular, fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 160 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  cardContent: { padding: 12 },
    title: { fontFamily: fonts.regular, fontSize: 16, fontWeight: 'bold', color: colors.text },
    location: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
    price: { fontFamily: fonts.regular, fontSize: 16, fontWeight: 'bold', color: colors.primary, marginTop: 4 },
  rating: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginLeft: 2 },
  unsaveButton: { position: 'absolute', top: 12, right: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: { fontFamily: fonts.regular, fontSize: 18, fontWeight: '600', color: colors.textMuted },
    emptySub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSubtle, marginTop: 8 },
});
