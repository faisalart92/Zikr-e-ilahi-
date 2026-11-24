const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,".."),main=path.join(root,"android","app","src","main");
function find(dir,name){if(!fs.existsSync(dir))return null;for(const x of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,x.name);if(x.isDirectory()){const f=find(p,name);if(f)return f;}else if(x.name===name)return p;}return null;}
const activity=find(path.join(main,"java"),"MainActivity.java");
if(!activity)throw new Error("MainActivity not found");
const pkg=(fs.readFileSync(activity,"utf8").match(/^package\s+([\w.]+);/m)||[])[1];
if(!pkg)throw new Error("Package not detected");
const javaDir=path.dirname(activity),source=path.join(root,"native","android","PrayerTimesWidgetProvider.java");
fs.writeFileSync(path.join(javaDir,"PrayerTimesWidgetProvider.java"),fs.readFileSync(source,"utf8").replace("package com.faisalart92.zikreilahi;","package "+pkg+";"));
const res=path.join(main,"res");
function copy(src,dst){const p=path.join(res,dst);fs.mkdirSync(path.dirname(p),{recursive:true});fs.copyFileSync(path.join(root,"native","android",src),p);}
copy("prayer_times_widget.xml","layout/prayer_times_widget.xml");copy("prayer_widget_bg.xml","drawable/prayer_widget_bg.xml");copy("prayer_times_widget_info.xml","xml/prayer_times_widget_info.xml");
const strings=path.join(res,"values","strings.xml");fs.mkdirSync(path.dirname(strings),{recursive:true});
let s=fs.existsSync(strings)?fs.readFileSync(strings,"utf8"):"<resources></resources>";
if(!s.includes("prayer_widget_description"))s=s.replace("</resources>","<string name=\"prayer_widget_description\">Prayer timings widget</string></resources>");
fs.writeFileSync(strings,s);
const manifest=path.join(main,"AndroidManifest.xml");let xml=fs.readFileSync(manifest,"utf8");
if(!xml.includes("PrayerTimesWidgetProvider"))xml=xml.replace("</application>",'<receiver android:name=".PrayerTimesWidgetProvider" android:exported="true"><intent-filter><action android:name="android.appwidget.action.APPWIDGET_UPDATE"/></intent-filter><meta-data android:name="android.appwidget.provider" android:resource="@xml/prayer_times_widget_info"/></receiver></application>');
fs.writeFileSync(manifest,xml);
console.log("Prayer widget native files and manifest entry added.");