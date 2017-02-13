package emersonengagementlab.edu.atstake;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;

import org.json.JSONException;
import org.json.JSONObject;

public class WebActivity extends Activity {

    String urlString = "http://app.local:3000/play/mobile";
    WebView gameWebView;

    public class WebAppInterface {

        Context mContext;

        /** Instantiate the interface and set the context */
        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void webViewResponse(String response) {

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

                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                gameWebView.setVisibility(View.VISIBLE);
                            }
                        });


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


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web);

        if(BuildConfig.ENVIRONMENT == "staging")
            urlString = "https://qa.atstakegame.com/play/mobile";
        if(BuildConfig.ENVIRONMENT == "production")
            urlString = "https://atstakegame.com/play/mobile";

        final Button joinGameBtn = (Button) findViewById(R.id.joinGame);
        final Button newGameBtn = (Button) findViewById(R.id.newGame);

        gameWebView = (WebView) findViewById(R.id.webView);

        gameWebView.getSettings().setJavaScriptEnabled(true);
        gameWebView.getSettings().setDomStorageEnabled(true);
        gameWebView.addJavascriptInterface(new WebAppInterface(this), "Android");

        gameWebView.setWebViewClient(new WebViewClient() {

            public void onPageFinished(WebView view, String url) {
                joinGameBtn.setVisibility(View.VISIBLE);
                newGameBtn.setVisibility(View.VISIBLE);
            }
        });

        gameWebView.loadUrl(urlString);

        joinGameBtn.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View view) {
                webAction("join");
            }
        });

        newGameBtn.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View view) {
                webAction("new");
            }
        });
    }
}
