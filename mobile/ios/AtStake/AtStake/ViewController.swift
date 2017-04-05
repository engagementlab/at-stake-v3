//
//  ViewController.swift
//  AtStake
//
//  Created by John Richardson on 2/8/17.
//  Copyright © 2017 Engagement Lab at Emerson College. All rights reserved.
//

import Foundation
import UIKit
import WebKit

class ViewController: UIViewController, WKUIDelegate, WKNavigationDelegate, WKScriptMessageHandler {
    
    @IBOutlet var containerView : UIView! = nil
    @IBOutlet weak var menuView: UIView!
    
    var webView: WKWebView!
    var contentController: WKUserContentController!
    var webConfig: WKWebViewConfiguration!
    
    // Makes calls to webview logic
    var callWebAction = WKUserScript(
        source: "mobileAction(strAction)",
        injectionTime: WKUserScriptInjectionTime.atDocumentEnd,
        forMainFrameOnly: true
    )
    
    // GAME ACTIONS
    @IBAction func joinGame() {
        
        webAction(actionString: "join");
        
    }
    
    @IBAction func hostGame() {
        
        webAction(actionString: "new");
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        
        menuView.isHidden = false
        
    }
    
    // Load URL to webview
    func loadURL() {
        #if DEVELOPMENT
        let urlString = "http://127.0.0.1:3000/play/mobile"
        #else
        let urlString = "https://qa.atstakegame.org/play/mobile"
        #endif
        
        guard let url = NSURL(string: urlString) else {return}
        let request = NSMutableURLRequest(url:url as URL)
        webView.load(request as URLRequest)
    }
    
    func webAction(actionString: String) {
        
        webView.evaluateJavaScript("mobileAction('\(actionString)')") { (result, error) in
            if error != nil {
                print(result ?? "Unable to print mobileAction response:")
                print(error?.localizedDescription as Any)
            }
        }
        
    }

    override func viewDidLoad() {
        
        super.viewDidLoad()
        
        // Create webview and its config
        contentController = WKUserContentController()
        webConfig = WKWebViewConfiguration()
        
        contentController.add(
            self,
            name: "callbackHandler"
        )
        webConfig.userContentController = contentController
        
        webView = WKWebView(
            frame: containerView.frame,
            configuration: webConfig
        )
        webView.navigationDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
//        webView.isHidden = true
        
        view.addSubview(webView)
        
        loadURL()
        contentController.addUserScript(callWebAction)
        
    }

    override func didReceiveMemoryWarning() {
        
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    
    }
    
    // Respond to calls from webview
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        
        if let messageBody: NSDictionary = message.body as? NSDictionary {
            
            // Webview returned valid response?
            if(messageBody["status"] as! String == "okeydokey") {
                
                switch(messageBody["action"] as! String) {
                    
                    // New game UI opened
                    case "new":
                        
                        self.webView.isHidden = false;
                        
                        break;
                        
                    default:
                        
                        print("No handler for action '\(messageBody["action"])\'")
                        
                        break;
                        
                }
                
            }
            
        }
    }

}
