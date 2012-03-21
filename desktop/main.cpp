#include <QtGui/QApplication>
#include <QWebView>
#include <QWebSettings>
#include <QWebInspector>
#include <QUrl>
#include <QString>

int main(int argc, char *argv[]) {

    QString storagePath = QString('/tmp/data');

    QApplication a(argc, argv);

    QWebView *view = new QWebView;
    QWebInspector *inspector = new QWebInspector;
    QWebPage *page = view->page();
    QWebSettings *settings = page->settings();

    settings->enablePersistentStorage("/tmp/data");

    // Enable localstorage
    settings->setAttribute(QWebSettings::LocalStorageEnabled, true);
    //settings->setLocalStoragePath("/tmp/data");

    // Enable WebSQl database
    settings->setAttribute(QWebSettings::OfflineStorageDatabaseEnabled,true);
    //settings->setOfflineStoragePath("/tmp/data");
    settings->setOfflineStorageDefaultQuota(5*1024*1024);

    // Enable Offline AppCache
    settings->setAttribute(QWebSettings::OfflineWebApplicationCacheEnabled,true);
    //settings->setOfflineWebApplicationCachePath("/tmp/data");
    settings->setOfflineWebApplicationCacheQuota(5*1024*1024);

    // Load the Web-App
    view->load(QUrl("http://localhost:8888/"));

    // Enable Inspect option
    settings->setAttribute(QWebSettings::DeveloperExtrasEnabled, true);
    inspector->setPage(page);

    view->show();
    inspector->show();

    return a.exec();
}
