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
import Reachability

class ViewController: UIViewController, WKUIDelegate, WKNavigationDelegate, WKScriptMessageHandler {
    
    @IBOutlet var containerView : UIView! = nil
    
    var webView: WKWebView!
    var contentController: WKUserContentController!
    var webConfig: WKWebViewConfiguration!
    var webViewLoaded:Bool = false
    
    var connectionAlert: UIAlertController!
    
    #if DEVELOPMENT
        let urlString = "http://127.0.0.1:3000/play/mobile"
    #else
    #if PRODUCTION
        let urlString = "https://atstakegame.org/play/mobile"
    #else
        let urlString = "https://qa.atstakegame.org/play/mobile"
    #endif
    #endif
   
    // Makes calls to webview logic
    var callWebAction = WKUserScript(
        source: "mobileAction(strAction)",
        injectionTime: WKUserScriptInjectionTime.atDocumentEnd,
        forMainFrameOnly: true
    )
    
    var reachability: Reachability?
    
    // GAME ACTIONS
    @IBAction func joinGame() {
        
        webAction(actionString: "join");
        
    }
    
    @IBAction func hostGame() {
        
        webAction(actionString: "new");
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        
        // Wait 2 seconds before showing web app
        let dispatchTime = DispatchTime.now() + DispatchTimeInterval.seconds(2)
        DispatchQueue.main.asyncAfter(deadline: dispatchTime) {
            self.webView.isHidden = false
        }
        webViewLoaded = true
    
    }
    
    // Load URL to webview
    func loadURL() {
        
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
        
        // Force portait mode on load
        UIDevice.current.setValue(UIInterfaceOrientation.portrait.rawValue, forKey: "orientation")
        
        UIViewController.attemptRotationToDeviceOrientation()
        
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
        webView.isHidden = true
        webView.translatesAutoresizingMaskIntoConstraints = false
        
        view.addSubview(webView)
        
        loadURL()
        contentController.addUserScript(callWebAction)
        
        // Start reachability without a hostname intially
        setupReachability(nil)
        startNotifier()
        
        // After 5 seconds, stop and re-start reachability, this time using a hostname
        let dispatchTime = DispatchTime.now() + DispatchTimeInterval.seconds(5)
        DispatchQueue.main.asyncAfter(deadline: dispatchTime) {
            self.stopNotifier()
            self.setupReachability("atstakegame.org")
            self.startNotifier()
        }
    }

    override func didReceiveMemoryWarning() {
        
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    
    }
    
    // Hide status bar
    override var prefersStatusBarHidden: Bool {
        return true
    }
    
    // Prevent rotation
    override var shouldAutorotate: Bool {
        return false
    }
    
    // Force portrait mode
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return UIInterfaceOrientationMask.portrait
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
    
    
    func updateWhenReachable(_ reachability: Reachability) {
        
        if reachability.isReachable {
            if(!webViewLoaded) {
                DispatchQueue.main.async {
                    if(self.connectionAlert != nil) {
                        self.connectionAlert.dismiss(animated: true, completion: nil)
                    }
                    self.loadURL()
                }
            }
        }
        
    }
    
    func updateWhenNotReachable(_ reachability: Reachability) {
        
        // If web not reachable, tell user to go to settings and enable wifi
        if !reachability.isReachable {
            
            connectionAlert = UIAlertController(title: "No connection",
                                          message: "@Stake requires an active internet connection. Please connect over wi-fi or mobile network and re-open the app.",
                                          preferredStyle: UIAlertControllerStyle.alert)
            connectionAlert.addAction(UIAlertAction(title: "Go to Settings", style: UIAlertActionStyle.default, handler: {
                (action:UIAlertAction!) -> Void in
                
                guard let settingsUrl = URL(string: UIApplicationOpenSettingsURLString) else {
                    return
                }
                
                if UIApplication.shared.canOpenURL(settingsUrl) {
                    UIApplication.shared.openURL(settingsUrl)
                }
                
            }))
            self.present(connectionAlert, animated: true, completion: nil)
            
        }
        
    }
    
    // Sets up reachibility monitor
    func setupReachability(_ hostName: String?) {
        
        let reachability = hostName == nil ? Reachability() : Reachability(hostname: hostName!)
        self.reachability = reachability
        
        reachability?.whenReachable = { reachability in
            DispatchQueue.main.async {
                self.updateWhenReachable(reachability)
            }
        }
        reachability?.whenUnreachable = { reachability in
            DispatchQueue.main.async {
                self.updateWhenNotReachable(reachability)
            }
        }
    
    }
    
    func startNotifier() {
        do {
            try reachability?.startNotifier()
        } catch {
            
            return
        }
    }
    
    func stopNotifier() {
        reachability?.stopNotifier()
        NotificationCenter.default.removeObserver(self, name: ReachabilityChangedNotification, object: nil)
        reachability = nil
    }
    
    func reachabilityChanged(_ note: Notification) {
        let reachability = note.object as! Reachability
        
        if !reachability.isReachable {
            updateWhenNotReachable(reachability)
        }
        else {
            updateWhenReachable(reachability)
        }
    }
    
    deinit {
        stopNotifier()
    }
    
}
