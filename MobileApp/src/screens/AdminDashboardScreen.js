import React, { useEffect, useState, useCallback, memo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  RefreshControl,
  Image,
  Dimensions,
  TextInput,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ShieldCheck, User, CheckCircle, XCircle, Trash2, Users, Search, Sprout, Upload, Plus, Pencil } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/config';
import { THEME } from '../styles/theme';

const { width } = Dimensions.get('window');

// ─── MUST be outside the main screen to keep a stable identity on re-renders ───
// If defined inside, every parent state update creates a new component class,
// which forces React Native to unmount/remount it and dismiss the keyboard.
const MarketDemandForm = memo(({
  marketForm,
  setMarketForm,
  marketImage,
  setMarketImage,
  editingMarketId,
  setEditingMarketId,
  marketSubmitLoading,
  handleMarketSubmit,
}) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });
    if (!result.canceled) setMarketImage(result.assets[0]);
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {editingMarketId ? '✏️  Edit Market Demand' : 'Add New Market Demand'}
      </Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Crop Name (e.g., Wheat)"
          placeholderTextColor="#94A3B8"
          value={marketForm.crop}
          onChangeText={(text) => setMarketForm(prev => ({ ...prev, crop: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Region (e.g., Punjab)"
          placeholderTextColor="#94A3B8"
          value={marketForm.region}
          onChangeText={(text) => setMarketForm(prev => ({ ...prev, region: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Quantity"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={marketForm.quantity}
          onChangeText={(text) => setMarketForm(prev => ({ ...prev, quantity: text }))}
        />
        <TouchableOpacity
          style={styles.unitSelector}
          onPress={() => setMarketForm(prev => ({
            ...prev,
            quantityUnit: prev.quantityUnit === 'kg' ? 'quintal' : prev.quantityUnit === 'quintal' ? 'ton' : 'kg'
          }))}
        >
          <Text style={styles.unitText}>{marketForm.quantityUnit.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Price per Unit (₹)"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={marketForm.price}
          onChangeText={(text) => setMarketForm(prev => ({ ...prev, price: text }))}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Season (e.g., Rabi)"
          placeholderTextColor="#94A3B8"
          value={marketForm.season}
          onChangeText={(text) => setMarketForm(prev => ({ ...prev, season: text }))}
        />
      </View>

      <View style={styles.demandLevelContainer}>
        <Text style={styles.label}>Demand Priority Level:</Text>
        <View style={styles.demandLevelRow}>
          {['low', 'medium', 'high'].map(level => (
            <TouchableOpacity
              key={level}
              style={[styles.levelBtn, marketForm.demandLevel === level && styles.levelBtnActive]}
              onPress={() => setMarketForm(prev => ({ ...prev, demandLevel: level }))}
            >
              <Text style={[styles.levelBtnText, marketForm.demandLevel === level && styles.levelBtnTextActive]}>
                {level.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
        {marketImage ? (
          <Image source={{ uri: marketImage.uri }} style={styles.imagePreview} />
        ) : (
          <>
            <Upload color="#94A3B8" size={24} />
            <Text style={styles.imageBtnText}>Upload Reference Image (Optional)</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.submitActionsRow}>
        <TouchableOpacity
          style={[styles.submitBtn, editingMarketId ? { flex: 0.6 } : { flex: 1 }]}
          onPress={handleMarketSubmit}
          disabled={marketSubmitLoading}
        >
          {marketSubmitLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              {!editingMarketId && <Plus color="white" size={20} />}
              <Text style={styles.submitBtnText}>
                {editingMarketId ? 'Update Demand' : 'Publish Demand'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        {editingMarketId && (
          <TouchableOpacity
            style={styles.cancelEditBtn}
            onPress={() => {
              setEditingMarketId(null);
              setMarketForm({ crop: '', region: '', demandLevel: 'medium', season: '', quantity: '', quantityUnit: 'kg', price: '' });
              setMarketImage(null);
            }}
          >
            <Text style={styles.cancelEditText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />
      <Text style={styles.listHeaderTitle}>Active Platform Demands</Text>
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboardScreen = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [marketDemands, setMarketDemands] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [marketForm, setMarketForm] = useState({
    crop: '', region: '', demandLevel: 'medium', season: '', quantity: '', quantityUnit: 'kg', price: '',
  });
  const [marketImage, setMarketImage] = useState(null);
  const [marketSubmitLoading, setMarketSubmitLoading] = useState(false);
  const [editingMarketId, setEditingMarketId] = useState(null);
  const [selectedDemandId, setSelectedDemandId] = useState(null);

  const fetchData = async () => {
    try {
      const [pendingRes, allRes, marketRes] = await Promise.all([
        api.get('/api/admin/pending-users'),
        api.get('/api/admin/users'),
        api.get('/api/market/demand'),
      ]);
      setPendingUsers(pendingRes.data.users || []);
      setAllUsers(allRes.data.users || []);
      setMarketDemands(marketRes.data?.demands || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      Alert.alert('Data Error', 'Unable to fetch data from the server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  const handleAction = async (userId, action) => {
    if (action === 'delete') {
      Alert.alert('Confirm Delete', 'Are you sure you want to permanently delete this user?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => performAction(userId, action) },
      ]);
    } else {
      performAction(userId, action);
    }
  };

  const performAction = async (userId, action) => {
    setActionLoading(userId);
    try {
      if (action === 'approve') {
        await api.patch(`/api/admin/approve/${userId}`);
        Alert.alert('Success', 'Farmer approved successfully!');
      } else if (action === 'reject') {
        await api.patch(`/api/admin/reject/${userId}`);
        Alert.alert('Status Updated', 'Farmer request has been rejected.');
      } else if (action === 'delete') {
        await api.delete(`/api/admin/user/${userId}`);
        Alert.alert('User Removed', 'User has been deleted from the database.');
      }
      fetchData();
    } catch (error) {
      Alert.alert('Action Error', error.response?.data?.message || 'Operation failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditMarket = (demand) => {
    setMarketForm({
      crop: demand.crop,
      region: demand.region,
      demandLevel: demand.demandLevel || 'medium',
      season: demand.season,
      quantity: String(demand.quantity),
      quantityUnit: demand.quantityUnit || 'kg',
      price: String(demand.price),
    });
    setEditingMarketId(demand._id);
    setMarketImage(null);
    setSelectedDemandId(null);
    setActiveTab('market');
  };

  const handleDeleteMarket = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this market demand?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/market/demand/${id}`);
            fetchData();
            Alert.alert('Success', 'Market demand deleted successfully.');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete market demand.');
          }
        },
      },
    ]);
  };

  const handleMarketSubmit = async () => {
    if (!marketForm.crop || !marketForm.region || !marketForm.quantity || !marketForm.price) {
      Alert.alert('Validation Error', 'Please fill all required fields (Crop, Region, Quantity, Price)');
      return;
    }
    setMarketSubmitLoading(true);
    try {
      let imageUrl = '';
      if (marketImage) {
        const formData = new FormData();
        const filename = marketImage.uri.split('/').pop() || 'market.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('image', { uri: marketImage.uri, name: filename, type });
        const uploadRes = await api.post('/api/image/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      if (editingMarketId) {
        await api.put(`/api/market/demand/${editingMarketId}`, {
          ...marketForm,
          ...(imageUrl ? { imageUrl } : {}),
        });
        Alert.alert('Success', 'Market demand updated successfully!');
      } else {
        await api.post('/api/market/demand', { ...marketForm, imageUrl });
        Alert.alert('Success', 'Market demand added successfully!');
      }

      setMarketForm({ crop: '', region: '', demandLevel: 'medium', season: '', quantity: '', quantityUnit: 'kg', price: '' });
      setEditingMarketId(null);
      setMarketImage(null);
      fetchData();
    } catch (error) {
      console.error('Submit market error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to process market demand');
    } finally {
      setMarketSubmitLoading(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <BlurView intensity={50} tint="light" style={styles.userCard}>
        <View style={styles.cardTop}>
          <View style={styles.avatarContainer}>
            {item.profileImage?.url || item.profileImageUrl || (typeof item.profileImage === 'string' && item.profileImage) ? (
              <Image
                source={{ uri: item.profileImage?.url || item.profileImageUrl || (typeof item.profileImage === 'string' ? item.profileImage : '') }}
                style={styles.avatarImg}
              />
            ) : (
              <User color={THEME.colors.primary} size={24} />
            )}
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.statusTag, {
                backgroundColor: item.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' :
                  item.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              }]}>
                <Text style={[styles.statusTagText, {
                  color: item.status === 'approved' ? '#059669' :
                    item.status === 'pending' ? '#B45309' : '#DC2626'
                }]}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userPhone}>{item.phone || 'No phone provided'}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          {item.status === 'pending' && (
            <>
              <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleAction(item._id, 'approve')} disabled={!!actionLoading}>
                {actionLoading === item._id ? <ActivityIndicator size="small" color="white" /> : (
                  <><CheckCircle size={16} color="white" /><Text style={styles.actionBtnText}>Approve</Text></>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleAction(item._id, 'reject')} disabled={!!actionLoading}>
                <XCircle size={16} color="white" />
                <Text style={styles.actionBtnText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleAction(item._id, 'delete')} disabled={!!actionLoading}>
            <Trash2 size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );

  const renderMarketDemandItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={() => setSelectedDemandId(prev => prev === item._id ? null : item._id)}
      onPress={() => setSelectedDemandId(null)}
      style={styles.cardWrapper}
    >
      <BlurView intensity={50} tint="light" style={styles.userCard}>
        <View style={styles.cardTop}>
          <View style={[styles.avatarContainer, { backgroundColor: '#EEF2FF' }]}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.avatarImg} />
            ) : (
              <Sprout color={THEME.colors.primary} size={24} />
            )}
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>{item.crop}</Text>
              <View style={[styles.statusTag, { backgroundColor: THEME.colors.primary + '20' }]}>
                <Text style={[styles.statusTagText, { color: THEME.colors.primary }]}>
                  {item.demandLevel?.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.userEmail}>{item.region} • {item.season}</Text>
            <Text style={styles.userPhone}>Qty: {item.quantity} {item.quantityUnit}  |  ₹{item.price}</Text>
          </View>
        </View>

        {selectedDemandId === item._id && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
              onPress={() => handleEditMarket(item)}
            >
              <Pencil size={16} color="white" />
              <Text style={styles.actionBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => { setSelectedDemandId(null); handleDeleteMarket(item._id); }}
            >
              <Trash2 size={16} color="white" />
              <Text style={styles.actionBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </BlurView>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator color={THEME.colors.primary} size="large" />
      <Text style={styles.loadingText}>Loading Admin Data...</Text>
    </View>
  );

  const marketFormHeader = (
    <MarketDemandForm
      marketForm={marketForm}
      setMarketForm={setMarketForm}
      marketImage={marketImage}
      setMarketImage={setMarketImage}
      editingMarketId={editingMarketId}
      setEditingMarketId={setEditingMarketId}
      marketSubmitLoading={marketSubmitLoading}
      handleMarketSubmit={handleMarketSubmit}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>

        <View style={styles.header}>
          <Text style={styles.panelTag}>ADMINISTRATION CONTROL</Text>
          <Text style={styles.panelTitle}>Guardian Panel</Text>

          <View style={styles.statsBar}>
            <TouchableOpacity style={[styles.statChip, activeTab === 'pending' && styles.statChipActive]} onPress={() => setActiveTab('pending')}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}><ShieldCheck size={18} color="#D97706" /></View>
              <View>
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={styles.statValue}>{pendingUsers.length}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statChip, activeTab === 'all' && styles.statChipActive]} onPress={() => setActiveTab('all')}>
              <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}><Users size={18} color="#3B82F6" /></View>
              <View>
                <Text style={styles.statLabel}>Users</Text>
                <Text style={styles.statValue}>{allUsers.length}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statChip, activeTab === 'market' && styles.statChipActive]} onPress={() => setActiveTab('market')}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}><Sprout size={18} color="#2563EB" /></View>
              <View>
                <Text style={styles.statLabel}>Demands</Text>
                <Text style={styles.statValue}>{marketDemands.length}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'pending' && styles.activeTab]} onPress={() => setActiveTab('pending')}>
            <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Pending</Text>
            {pendingUsers.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{pendingUsers.length}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'all' && styles.activeTab]} onPress={() => setActiveTab('all')}>
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Farmers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'market' && styles.activeTab]} onPress={() => setActiveTab('market')}>
            <Text style={[styles.tabText, activeTab === 'market' && styles.activeTabText]}>Demands</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeTab === 'pending' ? pendingUsers : activeTab === 'all' ? allUsers : marketDemands}
          renderItem={activeTab === 'market' ? renderMarketDemandItem : renderUserItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={activeTab === 'market' ? marketFormHeader : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Search size={48} color="#E2E8F0" />
              <Text style={styles.emptyText}>
                {activeTab === 'pending' ? 'No pending approvals found.' : activeTab === 'all' ? 'No farmers registered yet.' : 'No market demands found. Add one above.'}
              </Text>
            </View>
          }
        />

        <View style={{ height: 120 }} />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 13, color: THEME.colors.body, fontWeight: '600' },

  header: { 
    paddingHorizontal: 25, 
    paddingTop: Platform.OS === 'android' ? 60 : 25,
    paddingBottom: 15 
  },
  panelTag: { fontSize: 10, fontWeight: '900', color: THEME.colors.primary, letterSpacing: 2.5, marginBottom: 8 },
  panelTitle: { fontSize: 32, fontWeight: '900', color: THEME.colors.title },

  statsBar: { flexDirection: 'row', gap: 10, marginTop: 25 },
  statChip: { flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#F1F5F9' },
  statChipActive: { borderColor: THEME.colors.primary, backgroundColor: 'rgba(16,185,129,0.06)' },
  statIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900', color: THEME.colors.title },

  tabContainer: { flexDirection: 'row', marginHorizontal: 25, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 16, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, borderRadius: 12 },
  activeTab: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  tabText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  activeTabText: { color: THEME.colors.primary },
  badge: { backgroundColor: THEME.colors.primary, borderRadius: 10, paddingHorizontal: 5, paddingVertical: 2 },
  badgeText: { color: 'white', fontSize: 9, fontWeight: '900' },

  list: { paddingHorizontal: 25 },
  cardWrapper: { marginBottom: 15 },
  userCard: { borderRadius: 24, padding: 18, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', overflow: 'hidden' },
  cardTop: { flexDirection: 'row', gap: 15 },
  avatarContainer: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 3, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: 16, fontWeight: '800', color: THEME.colors.title, flex: 1 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusTagText: { fontSize: 9, fontWeight: '900' },
  userEmail: { fontSize: 13, color: THEME.colors.subtitle, marginTop: 4 },
  userPhone: { fontSize: 12, color: THEME.colors.body, marginTop: 4, fontWeight: '600' },

  cardActions: { flexDirection: 'row', gap: 10, marginTop: 15 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  approveBtn: { backgroundColor: THEME.colors.primary },
  rejectBtn: { backgroundColor: '#EF4444' },
  deleteBtn: { flex: 0.25, backgroundColor: 'rgba(241, 245, 249, 0.8)', borderWidth: 1, borderColor: '#E2E8F0' },
  actionBtnText: { color: 'white', fontSize: 13, fontWeight: '800' },

  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.6 },
  emptyText: { color: '#64748B', marginTop: 15, fontSize: 15, fontWeight: '700' },

  // Market Form Styles
  formContainer: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 24, padding: 22, marginBottom: 25, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)' },
  formTitle: { fontSize: 18, fontWeight: '900', color: THEME.colors.title, marginBottom: 20 },
  inputGroup: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 14, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#E2E8F0', color: THEME.colors.title, fontSize: 14, fontWeight: '600' },
  unitSelector: { backgroundColor: '#F1F5F9', borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  unitText: { fontSize: 13, fontWeight: '800', color: THEME.colors.primary },
  demandLevelContainer: { marginBottom: 16, marginTop: 4 },
  label: { fontSize: 12, fontWeight: '800', color: THEME.colors.subtitle, marginBottom: 10 },
  demandLevelRow: { flexDirection: 'row', gap: 10 },
  levelBtn: { flex: 1, backgroundColor: 'white', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  levelBtnActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  levelBtnText: { fontSize: 11, fontWeight: '800', color: '#64748B' },
  levelBtnTextActive: { color: 'white' },
  imageBtn: { height: 110, backgroundColor: 'rgba(255,255,255,0.5)', borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  imageBtnText: { marginTop: 10, fontSize: 13, fontWeight: '700', color: '#64748B' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  submitActionsRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  submitBtn: { backgroundColor: THEME.colors.primary, borderRadius: 16, height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: THEME.colors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitBtnText: { color: 'white', fontSize: 13, fontWeight: '900' },
  cancelEditBtn: { flex: 0.4, backgroundColor: '#94A3B8', borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center' },
  cancelEditText: { color: 'white', fontSize: 14, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginTop: 25, marginBottom: 20 },
  listHeaderTitle: { fontSize: 14, fontWeight: '900', color: THEME.colors.title, marginBottom: 5, letterSpacing: 0.5, textTransform: 'uppercase' },
});

export default AdminDashboardScreen;
