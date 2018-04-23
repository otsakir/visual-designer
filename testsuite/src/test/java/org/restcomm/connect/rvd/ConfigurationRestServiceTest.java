package org.restcomm.connect.rvd;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.glassfish.jersey.client.ClientResponse;
import org.jboss.arquillian.container.test.api.Deployment;
import org.jboss.arquillian.junit.Arquillian;
import org.jboss.shrinkwrap.api.ShrinkWrap;
import org.jboss.shrinkwrap.api.spec.WebArchive;
import org.jboss.shrinkwrap.resolver.api.maven.archive.ShrinkWrapMaven;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.WebTarget;

/**
 * @author otsakir@gmail.com - Orestis Tsakiridis
 */
@RunWith(Arquillian.class)
public class ConfigurationRestServiceTest extends RestServiceTest {



    @Test
    public void getPublicConfiguration() {
        Client jersey = getClient(null, null);
        WebTarget target = jersey.target( getResourceUrl("/services/config") );
        ClientResponse response = target.request().get(ClientResponse.class);
        Assert.assertEquals(200, response.getStatus());
        String json = response.readEntity(String.class);
        JsonParser parser = new JsonParser();
        JsonObject object = parser.parse(json).getAsJsonObject();
        // check presense of 'projectVersion' field
        Assert.assertNotNull("projectVersion field should exist", object.get("projectVersion"));
    }

    @Deployment(name = "ProjectRestServiceTest", managed = true, testable = false)
    public static WebArchive createWebArchiveNoGw() {
        //logger.info("Packaging Test App");
        //logger.info("version");
        WebArchive archive = ShrinkWrap.create(WebArchive.class, "restcomm-rvd.war");
        final WebArchive restcommArchive = ShrinkWrapMaven.resolver()
                .resolve("org.restcomm:restcomm-connect-rvd:war:" + "1.0-SNAPSHOT").withoutTransitivity()
                .asSingle(WebArchive.class);
        archive = archive.merge(restcommArchive);

        archive.addAsWebInfResource("restcomm.xml", "restcomm.xml");
        archive.delete("/WEB-INF/rvd.xml");
        archive.addAsWebInfResource("rvd.xml", "rvd.xml");
        //StringAsset rvdxml = "<rvd><workspaceLocation>workspace</workspaceLocation><workspaceBackupLocation></workspaceBackupLocation><restcommBaseUrl>" +  </restcommBaseUrl></rvd>";


        //logger.info("Packaged Test App");
        return archive;
    }
}
