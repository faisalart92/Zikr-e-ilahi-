package com.faisalart92.zikreilahi;

import android.app.*;
import android.content.*;
import android.media.*;
import android.os.*;
import androidx.core.app.NotificationCompat;

public class PrayerAzanService extends Service {
 private static final String CHANNEL="zikr_azan_audio";
 private static final int NOTIFICATION_ID=9901;
 private MediaPlayer player;
 @Override public void onCreate(){super.onCreate();createChannel();}
 @Override public int onStartCommand(Intent intent,int flags,int startId){
  if(intent!=null&&"STOP".equals(intent.getAction())){stopSelf();return START_NOT_STICKY;}
  String key=intent==null?"Dhuhr":intent.getStringExtra("prayer_key");
  String label=intent==null?"نماز":intent.getStringExtra("prayer_label");
  startForeground(NOTIFICATION_ID,notification(label));
  play(key);
  return START_NOT_STICKY;
 }
 private void createChannel(){
  if(Build.VERSION.SDK_INT>=26){
   NotificationChannel c=new NotificationChannel(CHANNEL,"اذان کی آواز",NotificationManager.IMPORTANCE_LOW);
   c.setDescription("نماز کے وقت مکمل اذان چلانے کے لیے");c.setSound(null,null);
   ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(c);
  }
 }
 private Notification notification(String label){
  Intent stop=new Intent(this,PrayerAzanService.class).setAction("STOP");
  PendingIntent pi=PendingIntent.getService(this,9902,stop,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(this,CHANNEL):new Notification.Builder(this);
  return b.setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle("اذان کا وقت ہوگیا")
   .setContentText(label+" کی اذان جاری ہے").setOngoing(true).setCategory(Notification.CATEGORY_ALARM)
   .addAction(android.R.drawable.ic_media_pause,"اذان بند کریں",pi).build();
 }
 private void play(String key){
  if(player!=null){try{player.stop();}catch(Exception ignored){}player.release();player=null;}
  int id=getResources().getIdentifier("adhan_"+(key==null?"dhuhr":key.toLowerCase()),"raw",getPackageName());
  if(id==0)id=getResources().getIdentifier("adhan_dhuhr","raw",getPackageName());
  if(id==0){stopSelf();return;}
  try{
   player=MediaPlayer.create(this,id);
   if(player==null){stopSelf();return;}
   player.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
   player.setWakeMode(getApplicationContext(),PowerManager.PARTIAL_WAKE_LOCK);
   player.setOnCompletionListener(mp->stopSelf());
   player.start();
  }catch(Exception e){android.util.Log.e("ZikrAzan","Audio playback failed",e);stopSelf();}
 }
 @Override public void onDestroy(){if(player!=null){try{if(player.isPlaying())player.stop();}catch(Exception ignored){}player.release();player=null;}stopForeground(true);super.onDestroy();}
 @Override public android.os.IBinder onBind(Intent intent){return null;}
}
