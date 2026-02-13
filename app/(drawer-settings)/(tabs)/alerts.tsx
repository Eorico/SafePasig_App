import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import Header from '@/app/components/ui/header';
import { X, CloudRain, Sun } from 'lucide-react-native';
import { alertStyles } from '@/app/appStyles/alerts.style';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { XMLParser } from 'fast-xml-parser';
import { getAlertColor, ALERT_COLORS } from '@/app/functionalities/alerts/alertsColor.img';
import { io } from "socket.io-client";

export default function AlertsScreen() {
  const navigation = useNavigation<any>();
  const [weather, setWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingTyphoon, setLoadingTyphoon] = useState(true);
  const [typhoons, setTyphoons] = useState<any[]>([]);
  const [disasterReports, setDisasterReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const WEATHER_API = '882a157d4e3d239fcaec8957c54ae8b3';
  const LAT = 14.5767;
  const LON = 121.0851;

  const socket  = io("https://safepasig-backend.onrender.com");

  const [currentUser, setCurrentUser] = useState<{ 
    id: string;           
    token?: string;       
    isPWD: boolean;
  }>({
    id: 'anonymous',       
    isPWD: false
  });

  useEffect(() => {

    socket.on('sos-alert', (data: any) => {
      setDisasterReports(prev => [
        {
          _id: data._id,
          type: data.type,
          description: data.description,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          createdAt: new Date().toISOString(),
        },
        ...prev
      ])
    });

    return () => {
      socket.off('sos-alert');
    };

  }, []);

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

  useEffect(() => {
    const fetReports = async () => {
      try {
        const res = await fetch('https://safepasig-backend.onrender.com/reports');
        const data = await res.json();
        const reports = data.map((r:any) => ({
          ...r,
          latitude: parseFloat(r.latitude),
          longitude: parseFloat(r.longitude),
        }));

        const uniqueReports = Array.from(
          new Map(reports.map((r:any) => [r._id, r])).values()
        );

        setDisasterReports(uniqueReports);
      } catch (error) {
        console.error("Failed to fetch disaster reports: ", error);
        
      } finally {
        setLoadingReports(false);
      }
    };

    fetReports();

    const interval = setInterval(fetReports, 15000);
    return () => clearInterval(interval);
  }, []);

  const dismissTyphoonAlert = (index: number) => {
    setTyphoons(prev => prev.filter((_, i) => i !== index));
  }

  const dismissReportAlert = (id: string) => {
    setDisasterReports(prev => prev.filter(report => report._id !== id));
  }

  return (
    <View style={alertStyles.container}>
      <Header 
        onMenuPress={() => navigation.openDrawer()} 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
      />
      <ScrollView style={alertStyles.scrollView} contentContainerStyle={alertStyles.content}>
        <Text style={alertStyles.pageTitle}>Active Alerts</Text>


        {/* Weather */}
        {loadingWeather ? (
          <ActivityIndicator size="large" color="#babdc2" />
        ) : weather ? (
          (() => {
            const color = getAlertColor(weather);

            // BLUE = photo background
            if (color === ALERT_COLORS.info) {
              return (
                <ImageBackground
                  source={require('@/assets/images/default.jpg')}
                  imageStyle={{ borderRadius: 12 }}
                  style={[alertStyles.alertCard, { borderLeftColor: color }]}
                >
                  <View style={alertStyles.overlay}>
                    <View style={alertStyles.alertHeader}>
                      
                      <Text style={alertStyles.alertTitle}>
                        <Sun size={30} color="white" /> Pasig Weather Update
                      </Text>
                      
                    </View>

                    <Text style={alertStyles.alertDescription}>
                      {weather.weather[0].description} | Temp: {weather.main.temp}°C | Humidity:{' '}
                      {weather.main.humidity}%
                    </Text>
                  </View>
                </ImageBackground>
              );
            }

            return (
              <View
                style={[
                  alertStyles.alertCard,
                  { backgroundColor: color, borderLeftColor: color },
                ]}
              >
                <View style={alertStyles.alertHeader}>
                  <Text style={alertStyles.alertTitle}>
                    <Sun size={30} color="white" /> Pasig Weather Update
                  </Text>
                </View>

                <Text style={alertStyles.alertDescription}>
                  {weather.weather[0].description} | Temp: {weather.main.temp}°C | Humidity:{' '}
                  {weather.main.humidity}%
                </Text>
              </View>
            );
          })()
        ) : (
          <Text style={{ color: 'red', marginVertical: 10 }}>Unable to fetch weather</Text>
        )}


        {/* Typhoon Alerts */}
        {loadingTyphoon ? (
          <ActivityIndicator size="large" color="#babdc2" />
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
                    style={[alertStyles.alertCard, 
                      { 
                        backgroundColor: getAlertColor(typhoon), 
                        borderLeftColor: '#DC2626'
                      }
                    ]}
                  >
                    <View style={alertStyles.alertHeader}>
                      <Text style={[alertStyles.alertTitle, { color: '#fff' }]}>
                        TYPHOON ALERT!: 
                        {" "}
                        {typhoon.title}
                      </Text>
                      <TouchableOpacity style={alertStyles.closeButton}>
                        <X size={20} color="#FFFFFF" onPress={() => dismissTyphoonAlert(idx)}/>
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

        {/* Disaster Reports Alerts */}
        {loadingReports ? (
          <ActivityIndicator size="large" color="#babdc2" />
        ) : (
          disasterReports.length > 0 &&
          disasterReports.map((report) => (
            <View key={report._id} style={[alertStyles.alertCard, { backgroundColor: '#DC2626', borderLeftColor: '#DC2626' }]}>
              <View style={alertStyles.alertHeader}>
                <Text style={[alertStyles.alertTitle, { color: '#fff' }]}>
                  NEW DISASTER REPORT: {report.type}
                </Text>
                <TouchableOpacity style={alertStyles.closeButton}>
                  <X size={20} color="#FFFFFF" onPress={() => dismissReportAlert(report._id)}/>
                </TouchableOpacity>
              </View>
              <Text style={alertStyles.alertDescription}>{report.description}</Text>
              <Text style={[alertStyles.timeText, { marginTop: 8 }]}>{new Date(report.createdAt).toLocaleString()}</Text>
            </View>
          ))
        )}
         
      </ScrollView>
    </View>
  );
}
