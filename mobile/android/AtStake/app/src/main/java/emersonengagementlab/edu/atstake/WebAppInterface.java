package emersonengagementlab.edu.atstake;

import android.content.Context;
import android.webkit.JavascriptInterface;

/**
 * Created by Johnny on 2/10/17.
 */
public class WebAppInterface {

    Context mContext;

    /** Instantiate the interface and set the context */
    WebAppInterface(Context c) {
        mContext = c;
    }

    @JavascriptInterface
    public void webViewResponse(String response) {
    }
}
