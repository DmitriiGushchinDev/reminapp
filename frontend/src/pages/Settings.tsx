import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, ArrowLeft, Moon, Sun, Globe, Bell, Shield, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language, languageOptions } from "@/i18n/translations";

type Theme = "light" | "dark" | "system";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage: setContextLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<Theme>("system");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    telegram: false,
  });

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      // System preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    toast({
      title: t("themeUpdated"),
      description: `${t("themeChangedTo")} ${newTheme}`,
    });
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setContextLanguage(newLanguage);
    const langLabel = languageOptions.find(l => l.value === newLanguage)?.label;
    toast({
      title: t("languageUpdated"),
      description: `${t("languageChangedTo")} ${langLabel}`,
    });
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast({
      title: t("notificationSettingsUpdated"),
      description: `${key} ${!notifications[key] ? t("notificationsEnabled") : t("notificationsDisabled")}`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToAppointments")}
          </Button>
          <div className="flex items-center gap-3 ml-4">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{t("settings")}</h1>
              <p className="text-muted-foreground">Manage your application preferences</p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t("appearance")}</CardTitle>
                <CardDescription>{t("appearanceDesc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="theme" className="text-base font-semibold">{t("theme")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("themeDesc")}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="h-24 flex flex-col gap-2"
                  onClick={() => handleThemeChange("light")}
                >
                  <Sun className="h-6 w-6" />
                  <span>{t("light")}</span>
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="h-24 flex flex-col gap-2"
                  onClick={() => handleThemeChange("dark")}
                >
                  <Moon className="h-6 w-6" />
                  <span>{t("dark")}</span>
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="h-24 flex flex-col gap-2"
                  onClick={() => handleThemeChange("system")}
                >
                  <SettingsIcon className="h-6 w-6" />
                  <span>{t("system")}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t("language")}</CardTitle>
                <CardDescription>{t("languageDesc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="language" className="text-base font-semibold">{t("displayLanguage")}</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue>
                    {languageOptions.find(l => l.value === language)?.flag}{" "}
                    {languageOptions.find(l => l.value === language)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t("languageInfo")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t("notifications")}</CardTitle>
                <CardDescription>{t("notificationsDesc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notif" className="text-base">{t("emailNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("emailNotificationsDesc")}
                  </p>
                </div>
                <Switch
                  id="email-notif"
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationToggle("email")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notif" className="text-base">{t("smsNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("smsNotificationsDesc")}
                  </p>
                </div>
                <Switch
                  id="sms-notif"
                  checked={notifications.sms}
                  onCheckedChange={() => handleNotificationToggle("sms")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="whatsapp-notif" className="text-base">{t("whatsappNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("whatsappNotificationsDesc")}
                  </p>
                </div>
                <Switch
                  id="whatsapp-notif"
                  checked={notifications.whatsapp}
                  onCheckedChange={() => handleNotificationToggle("whatsapp")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="telegram-notif" className="text-base">{t("telegramNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("telegramNotificationsDesc")}
                  </p>
                </div>
                <Switch
                  id="telegram-notif"
                  checked={notifications.telegram}
                  onCheckedChange={() => handleNotificationToggle("telegram")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t("privacySecurity")}</CardTitle>
                <CardDescription>{t("privacySecurityDesc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                {t("changePassword")}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                {t("twoFactorAuth")}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                {t("connectedAccounts")}
              </Button>
              <Separator className="my-4" />
              <Button variant="destructive" className="w-full">
                {t("deleteAccount")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
