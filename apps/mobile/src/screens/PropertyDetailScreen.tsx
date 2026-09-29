import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useQuery, useMutation } from 'react-query';
import api from '../services/api';
import { PropertyType, PropertyStatus } from '../types/enums';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts } from '../theme/brand';

type PropertyDetailRouteProp = RouteProp<{ PropertyDetail: { id: string } }, 'PropertyDetail'>;

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  price: number;
  currency: string;
  deposit: number;
  monthlyRent: number;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  maxOccupancy: number;
  amenities: string[];
  status: PropertyStatus;
  images: { id: string; url: string; altText?: string; isPrimary: boolean }[];
  reviews: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
  }[];
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    bio?: string;
    profileImage?: string;
  };
}

export default function PropertyDetailScreen({ navigation }: any) {
  const route = useRoute<PropertyDetailRouteProp>();
  const { id } = route.params;
  const { user } = useAuth();

  const { data: property, isLoading } = useQuery(['property', id], () =>
    api.get(`/properties/${id}`).then((res) => res.data.data.property as Property),
  );

  const saveMutation = useMutation(
    (propertyId: string) => api.post(`/properties/${propertyId}/save`).then((res) => res.data),
    {
      onSuccess: () => {
        Alert.alert('Saved', 'Property saved to your favorites');
      },
    }
  );

  const handleSave = () => {
    saveMutation.mutate(id);
  };

  const handleBook = () => {
    navigation.navigate('Booking', { propertyId: id });
  };

  const handleReport = () => {
    Alert.alert(
      'Report Listing',
      'What is the issue with this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Incorrect info', onPress: () => submitReport('Incorrect information') },
        { text: 'Spam/fake', onPress: () => submitReport('Spam or fake listing') },
        { text: 'Other', onPress: () => submitReport('Other issue') },
      ]
    );
  };

  const submitReport = (reason: string) => {
    api.post('/reports', {
      propertyId: id,
      reason,
    }).then(() => {
      Alert.alert('Report Submitted', 'Thank you for helping keep our platform safe.');
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <Text>Property not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        {property.images.length > 0 ? (
          <Image source={{ uri: property.images[0].url }} style={styles.mainImage} />
        ) : (
          <View style={[styles.mainImage, styles.placeholder]}>
            <Ionicons name="image" size={50} color={colors.textSubtle} />
          </View>
        )}
        {property.images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
            {property.images.slice(1).map((img) => (
              <Image key={img.id} source={{ uri: img.url }} style={styles.thumbnail} />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{property.title}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Ionicons name={user ? 'bookmark' : 'bookmark-outline'} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.location}>
          {property.address}, {property.city}, {property.state} {property.zipCode}
        </Text>

        <Text style={styles.price}>${property.monthlyRent}/month</Text>
        <Text style={styles.deposit}>Security Deposit: ${property.deposit}</Text>

        <View style={styles.stats}>
          <Text>{property.bedrooms} bed</Text>
          <Text> • </Text>
          <Text>{property.bathrooms} bath</Text>
          <Text> • </Text>
          <Text>{property.maxOccupancy} max</Text>
          <Text> • </Text>
          <Text>{property.propertyType}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenities}>
            {property.amenities.map((amenity, i) => (
              <View key={i} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({property.reviews.length})</Text>
          {property.reviews.map((review) => (
            <View key={review.id} style={styles.review}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>
                  {review.user.firstName} {review.user.lastName}
                </Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? 'star' : 'star-outline'}
                      size={14}
                      color={star <= review.rating ? colors.accent : colors.border}
                    />
                  ))}
                </View>
              </View>
              {review.comment && <Text style={styles.reviewText}>{review.comment}</Text>}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Landlord</Text>
          <View style={styles.landlord}>
            {property.landlord.profileImage ? (
              <Image source={{ uri: property.landlord.profileImage }} style={styles.landlordImage} />
            ) : (
              <View style={[styles.landlordImage, styles.landlordPlaceholder]}>
                <Text style={styles.landlordInitial}>
                  {property.landlord.firstName[0]}
                  {property.landlord.lastName[0]}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.landlordName}>
                {property.landlord.firstName} {property.landlord.lastName}
              </Text>
              <Text style={styles.landlordEmail}>{property.landlord.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Ionicons name="flag" size={20} color={colors.error} />
            <Text style={styles.reportText}>Report Listing</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageContainer: { padding: 16 },
  mainImage: { width: '100%', height: 240, borderRadius: 12 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  thumbnailContainer: { flexDirection: 'row', marginTop: 12 },
  thumbnail: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontFamily: fonts.regular, fontSize: 20, fontWeight: 'bold', color: colors.text },
    location: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 4 },
    price: { fontFamily: fonts.regular, fontSize: 22, fontWeight: 'bold', color: colors.primary, marginTop: 8 },
    deposit: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 2 },
  stats: { flexDirection: 'row', marginTop: 8, fontSize: 13, color: colors.textMuted },
  section: { marginTop: 20 },
    sectionTitle: { fontFamily: fonts.regular, fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
    description: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, lineHeight: 20 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    amenityText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text },
  review: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    reviewerName: { fontFamily: fonts.regular, fontWeight: '600', color: colors.text },
  stars: { flexDirection: 'row' },
    reviewText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  landlord: { flexDirection: 'row', alignItems: 'center' },
  landlordImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  landlordPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    landlordInitial: { fontFamily: fonts.regular, fontWeight: 'bold', color: colors.primary },
    landlordName: { fontFamily: fonts.regular, fontSize: 15, fontWeight: '600', color: colors.text },
    landlordEmail: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  actions: { marginTop: 24, gap: 12 },
  bookButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    bookButtonText: { fontFamily: fonts.regular, color: colors.white, fontSize: 16, fontWeight: '600' },
  reportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
    reportText: { fontFamily: fonts.regular, color: colors.error, fontSize: 14, marginLeft: 4 },
});
