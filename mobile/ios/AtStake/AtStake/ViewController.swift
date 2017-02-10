//
//  ViewController.swift
//  AtStake
//
//  Created by John Richardson on 2/8/17.
//  Copyright © 2017 Engagement Lab at Emerson College. All rights reserved.
//

import UIKit
import WebKit

class ViewController: UIViewController, WKUIDelegate, WKNavigationDelegate {
    
    @IBOutlet var containerView : UIView! = nil
    
    var webView: WKWebView!
    var contentController: WKUserContentController!
    var webConfig: WKWebViewConfiguration!
    
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
    
    
    // Load URL to webview
    func loadURL() {
        #if DEVELOPMENT
        let urlString = "http://127.0.0.1:3000/play/mobile"
        #else
        let urlString = "https://qa.atstakegame.com/play/mobile"
        #endif
        
        guard let url = NSURL(string: urlString) else {return}
        let request = NSMutableURLRequest(url:url as URL)
        webView.load(request as URLRequest)
    }
    
    func webAction(actionString: String) {
        
        webView.evaluateJavaScript("mobileAction('\(actionString)')") { (result: Any?, error: Error?) in
            if error != nil {
                print(result ?? "Unable to print mobileAction response:")
                print(error as Any)
            }
            else {
                
                print(result)
                
                if result as? String == "okeydokey" {
                    print("all good")
                    self.webView.isHidden = false
                }
                
//                do {
//                    
//                    let json = try JSONSerialization.jsonObject(with: result as! Data, options: []) as Dictionary
//                    print(json)
//                    
//                }
//                catch let error as NSError {
//                    print(error)
//                }
            }
        }
        
    }

    override func viewDidLoad() {
        
        super.viewDidLoad()
        
        // Create webview and its config
        contentController = WKUserContentController()
        webConfig = WKWebViewConfiguration()
        
        
//        contentController.addUserScript(callWebAction)
//        contentController.add(
//            self as! WKScriptMessageHandler,
//            name: "callbackHandler"
//        )
        
        webConfig.userContentController = contentController
        
        webView = WKWebView(
            frame: containerView.frame,
            configuration: webConfig
        )
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.isHidden = true
        
        view.addSubview(webView)

        /*
        view.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "|-[webView]-|",
                                                                           options: NSLayoutFormatOptions(rawValue: 0),
                                                                           metrics: nil,
                                                                           views: ["webView": webView]))
        view.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "V:|-20-[webView]-|",
                                                                           options: NSLayoutFormatOptions(rawValue: 0),
                                                                           metrics: nil,
                                                                           views: ["webView": webView]))
        */
        
        loadURL()
        contentController.addUserScript(callWebAction)
        
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // Respond to calls from webview
        func userContentController(userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if let messageBody: NSDictionary = message.body as? NSDictionary {
                if let innerBody: NSDictionary = messageBody["body"] as? NSDictionary {
                    print(innerBody)
                }
            }
        }


}

