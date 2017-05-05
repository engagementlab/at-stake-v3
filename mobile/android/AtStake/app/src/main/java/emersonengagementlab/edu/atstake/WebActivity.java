package emersonengagementlab.edu.atstake;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

import org.json.JSONException;
import org.json.JSONObject;

public class WebActivity extends Activity {

    String urlString = "http://app.local:3000/play/mobile";
    WebView gameWebView;
    AlertDialog connectionAlert;
    boolean webViewLoaded = false;

    public class WebAppInterface {

        Context mContext;

        /** Instantiate the interface and set the context */
        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void webViewResponse(String response) {

            // Could be used someday for handling web activity natively
            JSONObject jsonResponse = null;
            try {
                jsonResponse = new JSONObject(response);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            try {
                assert jsonResponse != null;
                String actionResponse = jsonResponse.getString("action");

                Log.v("WebResponse", actionResponse);

                switch(actionResponse) {

                    // game UI opened
                    case "join":
                    case "new":

                        break;

                    default:

                        Log.v("WebResponse", "No handler for action '" + actionResponse + "'");

                        break;

                }

            } catch (JSONException e) {
                e.printStackTrace();
            }

        }
    }

    void webAction(String actionString) {

        gameWebView.loadUrl("javascript:mobileAction('" + actionString + "')");

    }

    void checkConnection() {

        ConnectivityManager connManager = (ConnectivityManager) this.getApplicationContext().getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo mWifi = connManager.getActiveNetworkInfo();

        if (mWifi == null || !mWifi.isConnected()) {

            AlertDialog.Builder builder = new AlertDialog.Builder(this)
                                            .setTitle("No connection")
                                            .setMessage("@Stake requires an active internet connection. Please connect over wi-fi or mobile network and re-open the app.")
                                            .setPositiveButton("Go to Settings", new DialogInterface.OnClickListener() {
                                                public void onClick(DialogInterface dialog, int which) {
                                                    Intent i = new Intent(Settings.ACTION_WIFI_SETTINGS);
                                                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                                    startActivity(i);
                                                }
                                            })
                                            .setIcon(android.R.drawable.ic_dialog_alert);

            connectionAlert = builder.create();
            connectionAlert.show();

            return;
        }
        else {

            if(connectionAlert != null)
                connectionAlert.dismiss();

            if(!webViewLoaded)
                gameWebView.loadUrl(urlString);


        }

    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web);

        // Keep screen turned on
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        TextView buildTextView = (TextView) findViewById(R.id.buildText);

        if(BuildConfig.ENVIRONMENT == "staging") {
            urlString = "https://qa.atstakegame.org/play/mobile";
            buildTextView.setText("QA Build");
        }
        if(BuildConfig.ENVIRONMENT == "production") {
            urlString = "https://atstakegame.org/play/mobile";
            buildTextView.setVisibility(View.GONE);
        }

        gameWebView = (WebView) findViewById(R.id.webView);

        gameWebView.getSettings().setJavaScriptEnabled(true);
        gameWebView.getSettings().setDomStorageEnabled(true);
        gameWebView.addJavascriptInterface(new WebAppInterface(this), "Android");

        gameWebView.setWebViewClient(new WebViewClient() {

            public void onPageFinished(WebView view, String url) {
                webViewLoaded = true;
                gameWebView.setVisibility(View.VISIBLE);
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();

        checkConnection();

    }


    // Disable back button
    @Override
    public void onBackPressed() {
    }
}
