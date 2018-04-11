package org.restcomm.connect.rvd;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;

public class RestTesterClient {
    private static RestTesterClient instance;
    private Client client;
    
    private RestTesterClient() {
        client = ClientBuilder.newClient();
    };
    
    public static RestTesterClient getInstance() {
        if ( instance == null )
            instance = new RestTesterClient();
        return instance;
    }
    
    public Client getClient() {
        return client;
    }
    
    
}


