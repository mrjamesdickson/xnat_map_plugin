/*
 * XNAT Map Plugin
 * Copyright (c) 2025 XNATWorks.
 * All rights reserved.
 *
 * This software is distributed under the terms described in the LICENSE file.
 */

package org.xnat.map;

import org.nrg.framework.annotations.XnatPlugin;
import org.springframework.context.annotation.ComponentScan;

@XnatPlugin(value = "mapPlugin",
            name = "XNAT Map Plugin",
            description = "Interactive global map of XNAT installations")
@ComponentScan({"org.xnat.map"})
public class MapPlugin {
}
