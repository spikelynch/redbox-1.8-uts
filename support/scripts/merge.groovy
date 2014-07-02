/*
* Copyright (C) 2013 Queensland Cyber Infrastructure Foundation (http://www.qcif.edu.au/)
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation; either version 2 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License along
*   with this program; if not, write to the Free Software Foundation, Inc.,
*   51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
@Grab('com.googlecode.json-simple:json-simple:1.1')
@Grab(group = 'log4j', module = 'log4j', version = '1.2.12')
import groovy.util.logging.Log4j
import org.apache.log4j.PropertyConfigurator
import org.json.simple.JSONArray
import org.json.simple.JSONAware
import org.json.simple.JSONObject
import org.json.simple.parser.JSONParser

/**
 * @version
 * @author <a href="matt@redboxresearchdata.com.au">Matt Mulholland</a>
 */

MergeConfig mergeConfig = new MergeConfig()
JSONObject jsonResult = mergeConfig.deeperMerge(args[0], args[1])
mergeConfig.logJsonObject(jsonResult)

@Log4j
class MergeConfig {
    private static final String ITERATE_ERROR = "The compared objects do not contain compatible types"
    private static final String LOGGING_CONFIG_NAME = "log4j.groovy"

    static {
        def fileList = new FileNameFinder().getFileNames('./', "**/${LOGGING_CONFIG_NAME}")
        if (!fileList || fileList.size != 1) {
            throw new FileNotFoundException("Could not find unique logging config in recursive search.")
        }
        def file = new File(fileList.get(0))
        def config = new ConfigSlurper().parse(file.toURI().toURL())
        PropertyConfigurator.configure(config.toProperties())
    }

    /**
     * This is a deep merge function for 2 json documents. The source is used to add data to the target.
     * JSONObjects and JSONArrays are checked to allow nested data to be checked without performing a shallow clobber.
     * Is in untested against very complicated json data, but does work at levels deeper than shallow merge.
     * @param src the json object used to get new data
     * @param tgt the target of the merge. New data will be added. Pre-existing data will be clobbered
     * @return merged target
     */
    def JSONObject deeperMerge(final String source, final String template) {
        def expando = new Expando()
        JSONObject jsonSource = createJsonObject(source)
        JSONObject jsonTemplate = createJsonObject(template)
        JSONObject target = checkAndMerge(jsonSource, jsonTemplate, expando)
        return target
    }

    def logJsonObject(JSONObject object) {
        log.info(object)
    }

    def createJsonObject(String target) {
        JSONParser parser = new JSONParser()
        Object json = parser.parse(target)
        JSONObject jsonObject = JSONObject.cast(json)
        return jsonObject
    }

    def checkAndMerge = { source, target, Expando expando ->
        expando.parentFunction = checkAndMerge
        source.eachWithIndex { sourceElement, i ->
            if (source instanceof JSONArray && target instanceof JSONArray) {
                expando.altFunction = addToTarget
                stepIntoJsonArray(target, sourceElement, i, expando)
            } else if (source instanceof JSONObject && target instanceof JSONObject) {
                expando.altFunction = putInTarget
                stepIntoJsonObject(target, sourceElement, expando)
            } else {
                showError(ITERATE_ERROR)
            }
        }
        return target
    }

    private def addToTarget = { target, sourceElement ->
        target.add(sourceElement)
    }

    private def putInTarget = { target, sourceKey, sourceValue ->
        target.put(sourceKey, sourceValue)
    }

    private def showError = { String message ->
        throw new UnsupportedOperationException(message)
    }

    private def stepIntoJsonArray(JSONArray target, sourceElement, i, Expando expando) {
        if (i < target.size()) {
            if (sourceElement instanceof JSONAware) {
                expando.parentFunction(sourceElement, target.get(i), expando)
            } else if (!target.contains(sourceElement)) {
                expando.altFunction(target, sourceElement)
            }
        } else {
            expando.altFunction(target, sourceElement)
        }
    }

    private def stepIntoJsonObject(JSONObject target, sourceElement, Expando expando) {
        def sourceKey = sourceElement.key
        def sourceValue = sourceElement.value

        if (target.containsKey(sourceKey) && (sourceValue instanceof JSONAware)) {
            expando.parentFunction(sourceValue, target[sourceKey], expando)
        } else {
            expando.altFunction(target, sourceKey, sourceValue)
        }
    }
}