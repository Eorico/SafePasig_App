import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Header from '@/components/header';
import { X, CloudRain, CloudCheck, Sun } from 'lucide-react-native';
import { alerts } from '@/components/alertsObjs';
import { alertStyles } from '@/appStyles/alerts.style';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { XMLParser } from 'fast-xml-parser';

export default function AlertsScreen() {
  const navigation = useNavigation<any>();
  const [weather, setWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingTyphoon, setLoadingTyphoon] = useState(true);
  const [typhoons, setTyphoons] = useState<any[]>([]);

  const WEATHER_API = '882a157d4e3d239fcaec8957c54ae8b3';
  const LAT = 14.5767;
  const LON = 121.0851;

  // Fetch weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_API}`
        );
        const data = await res.json();
        setWeather(data);
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, []);

  // Fetch GDACS typhoon alerts
  useEffect(() => {
    const fetchTyphoons = async () => {
      try {
        const res = await fetch('https://www.gdacs.org/xml/rss.xml');
        const textData = await res.text();

        const parser = new XMLParser();
        const jsonData = parser.parse(textData);

        const items = jsonData?.rss?.channel?.item ?? [];

        const phTyphoons = items
          .filter((item: any) => {
            const title = (item?.title ?? '').toLowerCase();
            return title.includes('tropical cyclone') || title.includes('typhoon');
          })
          .map((item: any) => ({
            title: item.title,
            description: item.description,
            pubDate: item.pubDate,
            link: item.link,
          }));

        setTyphoons(phTyphoons);
      } catch (error) {
        console.error('Fetch typhoon error:', error);
      } finally {
        setLoadingTyphoon(false);
      }
    };
    fetchTyphoons();
  }, []);

  return (
    <View style={alertStyles.container}>
      <Header onMenuPress={() => navigation.openDrawer()} />
      <ScrollView style={alertStyles.scrollView} contentContainerStyle={alertStyles.content}>
        <Text style={alertStyles.pageTitle}>Active Alerts</Text>

        {/* Weather */}
        {loadingWeather ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : weather ? (
          <View
            style={[
              alertStyles.alertCard,
              { backgroundColor: '#2563EB', borderLeftColor: '#2563EB' },
            ]}
          >
            <View style={alertStyles.alertHeader}>
              <Text style={[alertStyles.alertTitle, { color: '#fff' }]}> 
                <Sun size={30} color={'white'}/>   Pasig Weather Update
              </Text>
              <TouchableOpacity style={alertStyles.closeButton}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={alertStyles.alertDescription}>
              {weather.weather[0].description} | Temp: {weather.main.temp}°C | Humidity:{' '}
              {weather.main.humidity}%
            </Text>
          </View>
        ) : (
          <Text style={{ color: 'red', marginVertical: 10 }}>Unable to fetch weather</Text>
        )}

        {/* Typhoon Alerts */}
        {loadingTyphoon ? (
          <ActivityIndicator size="large" color="#DC2626" />
        ) : (
          <>
            {typhoons.filter((typhoon) => {
              const desc = (typhoon.description ?? '').toLowerCase();
              return ['philippines', 'ph'].some((kw) => desc.includes(kw));
            }).length > 0 ? (
              typhoons
                .filter((typhoon) => {
                  const desc = (typhoon.description ?? '').toLowerCase();
                  return ['philippines', 'ph'].some((kw) => desc.includes(kw));
                })
                .map((typhoon, idx) => (
                  <View
                    key={idx}
                    style={[alertStyles.alertCard, { backgroundColor: '#DC2626', borderLeftColor: '#DC2626' }]}
                  >
                    <View style={alertStyles.alertHeader}>
                      <Text style={[alertStyles.alertTitle, { color: '#fff' }]}>
                        TYPHOON ALERT!
                        {typhoon.title}
                      </Text>
                      <TouchableOpacity style={alertStyles.closeButton}>
                        <X size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    <Text style={alertStyles.alertDescription}>{typhoon.description}</Text>
                    <Text style={[alertStyles.timeText, { marginTop: 8 }]}>{typhoon.pubDate}</Text>
                  </View>
                ))
            ) : (
              <View
                style={[alertStyles.alertCard, { backgroundColor: '#DC2626', borderLeftColor: '#DC2626' }]}
              >
                <Text style={[alertStyles.alertTitle, { color: '#fff', marginBottom: 8 }]}>
                  <CloudRain size={30} color={'white'}/> Typhoon Alert
                </Text>
                <Text style={alertStyles.alertDescription}>
                  No typhoon alerts for the Philippines at the moment
                </Text>
              </View>
            )}
          </>
        )}

        {/* Other Alerts */}
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <View
              key={alert.id}
              style={[alertStyles.alertCard, { backgroundColor: alert.color, borderLeftColor: alert.color }]}
            >
              <View style={alertStyles.alertHeader}>
                <View style={alertStyles.alertTitleRow}>
                  <Icon size={24} color="#FFFFFF" />
                  <Text style={alertStyles.alertTitle}>{alert.title}</Text>
                </View>
                <TouchableOpacity style={alertStyles.closeButton}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {alert.category && (
                <View style={alertStyles.categoryBadge}>
                  <Text style={alertStyles.categoryText}>{alert.category}</Text>
                </View>
              )}

              <Text style={alertStyles.alertDescription}>{alert.description}</Text>

              {alert.location && (
                <View style={alertStyles.alertFooter}>
                  <View style={alertStyles.locationBadge}>
                    <Text style={alertStyles.locationText}>📍 {alert.location}</Text>
                  </View>
                  <Text style={alertStyles.timeText}>{alert.time}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
