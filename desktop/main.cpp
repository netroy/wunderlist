#include <QtGui/QApplication>
#include <QWebView>
#include <QWebFrame>
#include <QWebSettings>
#include <QWebInspector>
#include <QUrl>
#include <QString>
#include <QDesktopServices>
#include <QMenu>
#include <QMenuBar>


int main(int argc, char *argv[]) {

    QString storagePath = QDesktopServices::storageLocation(QDesktopServices::DataLocation) + "/Wunderlist";

    QApplication a(argc, argv);

    QWebView *view = new QWebView;
    view->setMinimumSize(760, 450);

    QWebPage *page = view->page();
    QWebFrame *frame = page->mainFrame();
    QWebSettings *webViewSettings = page->settings()->globalSettings();

    QMenu *settingsMenu = new QMenu("&Settings");
    QMenu *aboutUsMenu = new QMenu("About &Us");
    QMenuBar *menuBar = new QMenuBar(view);
    menuBar->addMenu(settingsMenu);
    menuBar->addMenu(aboutUsMenu);

    // Enable Inspect option
    webViewSettings->setAttribute(QWebSettings::DeveloperExtrasEnabled, true);

    // Enable Remote URL access for Sync
    webViewSettings->setAttribute(QWebSettings::LocalContentCanAccessRemoteUrls, true);

    // All Offline storage path
    webViewSettings->enablePersistentStorage(storagePath);
    webViewSettings->setOfflineStoragePath(storagePath);

    // Enable localstorage
    webViewSettings->setAttribute(QWebSettings::LocalStorageEnabled, true);

    // Enable WebSQl database
    webViewSettings->setAttribute(QWebSettings::OfflineStorageDatabaseEnabled,true);
    webViewSettings->setOfflineStorageDefaultQuota(5*1024*1024);

    // Enable Offline AppCache
    webViewSettings->setAttribute(QWebSettings::OfflineWebApplicationCacheEnabled,true);
    webViewSettings->setOfflineWebApplicationCacheQuota(5*1024*1024);

    // Load the Web-App
    view->load(QUrl("http://localhost:8888/"));
    view->show();

    return a.exec();

}
