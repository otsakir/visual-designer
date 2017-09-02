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
 */

package org.restcomm.connect.rvd.model.steps.gather;

import java.util.List;
import org.restcomm.connect.rvd.model.project.BaseStep;

/**
 * @author otsakir@gmail.com - Orestis Tsakiridis
 */
public class GatherStep extends BaseStep {

    protected String action;
    protected String method;
    protected Integer timeout;
    protected String finishOnKey;
    protected Integer numDigits;
    protected List<BaseStep> steps;
    protected Validation validation;
    protected BaseStep invalidMessage;
    protected Menu menu;
    protected Collectdigits collectdigits;
    protected String gatherType;

    public final class Menu {
        public List<Mapping> mappings;
    }
    public final class Collectdigits {
        public String next;
        public String collectVariable;
        public String scope;
    }

    public static class Mapping {
        public String digits;
        public String next;
    }
    public final class Validation {
        public String userPattern;
        public String regexPattern;
    }

}