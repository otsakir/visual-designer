/*
 * TeleStax, Open Source Cloud Communications
 * Copyright 2011-2014, Telestax Inc and individual contributors
 * by the @authors tag.
 *
 * This program is free software: you can redistribute it and/or modify
 * under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of
 * the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

package org.restcomm.connect.rvd.helpers;

import junit.framework.Assert;
import org.junit.Test;
import org.restcomm.connect.rvd.RvdConfiguration;
import org.restcomm.connect.rvd.model.project.StateHeader;

/**
 * @author orestis.tsakiridis@telestax.com - Orestis Tsakiridis
 */
public class ProjectHelperTest {
    @Test
    public void testProjectStatusResolving() {
        ProjectHelper projectService = new ProjectHelper();

        StateHeader header = new StateHeader("voice","start", RvdConfiguration.RVD_PROJECT_VERSION);
        // latest RVD project version should be ok.
        Assert.assertEquals(ProjectHelper.Status.OK ,projectService.projectStatus(header));
        // null header should return BAD
        Assert.assertEquals(ProjectHelper.Status.BAD ,projectService.projectStatus(null));
        // null version should return BAD
        header.setVersion(null);
        Assert.assertEquals(ProjectHelper.Status.BAD ,projectService.projectStatus(header));
        // older project (upgradable) version should return SHOULD_UPGRADE
        header.setVersion("1.5");
        Assert.assertEquals(ProjectHelper.Status.SHOULD_UPGRADE ,projectService.projectStatus(header));
        // future project version should return  UNKNOWN_VERSION
        header.setVersion("1000");
        Assert.assertEquals(ProjectHelper.Status.UNKNOWN_VERSION ,projectService.projectStatus(header));
    }
}
