/*
 * XNAT Map Plugin
 * Copyright (c) 2025 XNATWorks.
 * All rights reserved.
 *
 * This software is distributed under the terms described in the LICENSE file.
 */

package org.xnat.map.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.nrg.framework.annotations.XapiRestController;
import org.nrg.xapi.rest.AbstractXapiRestController;
import org.nrg.xapi.rest.XapiRequestMapping;
import org.nrg.xdat.security.helpers.AccessLevel;
import org.nrg.xdat.security.services.RoleHolder;
import org.nrg.xdat.security.services.UserManagementServiceI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Api("XNAT Map API")
@XapiRestController
public class MapApi extends AbstractXapiRestController {

    private static final Logger log = LoggerFactory.getLogger(MapApi.class);
    private final ObjectMapper objectMapper;

    @Autowired
    public MapApi(final UserManagementServiceI userManagementService,
                  final RoleHolder roleHolder,
                  final ObjectMapper objectMapper) {
        super(userManagementService, roleHolder);
        this.objectMapper = objectMapper;
    }

    @ApiOperation(value = "Get all XNAT installation locations", response = Map.class, responseContainer = "List")
    @ApiResponses({
        @ApiResponse(code = 200, message = "Locations successfully retrieved."),
        @ApiResponse(code = 401, message = "Must be authenticated to access the XNAT REST API."),
        @ApiResponse(code = 500, message = "Unexpected error")
    })
    @XapiRequestMapping(value = "/map/locations", produces = APPLICATION_JSON_VALUE, method = RequestMethod.GET, restrictTo = AccessLevel.Read)
    public List<Map<String, Object>> getLocations() throws IOException {
        log.debug("Fetching XNAT installation locations");

        ClassPathResource resource = new ClassPathResource("META-INF/resources/xnat-map/locations.json");

        try (InputStream inputStream = resource.getInputStream()) {
            List<Map<String, Object>> locations = objectMapper.readValue(
                inputStream,
                objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );
            log.debug("Loaded {} locations", locations.size());
            return locations;
        }
    }
}
