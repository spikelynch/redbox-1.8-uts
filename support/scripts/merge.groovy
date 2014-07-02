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

def test1 = "{\n" +
        "  \"array\": [\n" +
        "    1,\n" +
        "    2,\n" +
        "    3,\n" +
        "    4\n" +
        "  ],\n" +
        "  \"boolean\": true,\n" +
        "  \"null\": null,\n" +
        "  \"number\": 123,\n" +
        "  \"object\": {\n" +
        "    \"a\": \"b\",\n" +
        "    \"c\": \"d\",\n" +
        "    \"e\": \"f\",\n" +
        "    \"somethingelse\": {\n" +
        "      \"blah\": \"test1\"\n" +
        "    }\n" +
        "  },\n" +
        "  \"string\": \"Hello World\"\n" +
        "}"

def test2 = "{\n" +
        "  \"array\": [\n" +
        "    1,\n" +
        "    2,\n" +
        "    3\n" +
        "  ],\n" +
        "  \"boolean\": true,\n" +
        "  \"boolean\": true,\n" +
        "  \"null\": null,\n" +
        "  \"number\": 123,\n" +
        "  \"object\": {\n" +
        "    \"a\": \"a\",\n" +
        "    \"c\": \"c\",\n" +
        "    \"e\": \"e\",\n" +
        "    \"somethingelse\" : {\n" +
        "      \"blah\" : \"test2\"\n" +
        "    }\n" +
        "  },\n" +
        "  \"string\": \"Hello World\"\n" +
        "}"

def mergeConfig = new MergeConfig()

JSONObject jsonResult = mergeConfig.deeperMerge(test1, test2)
mergeConfig.logJsonObject(jsonResult)
//String sourceString = JsonOutput.toJson(sourceBody)

@Log4j
class MergeConfig {
    private static final String ARRAY_ERROR = "The size of the envelope must be smaller than the source"
    private static final String ITERATE_ERROR = "The compared objects do not contain compatible types"
    private static final String MAP_ERROR = "Cannot find useful starting point"
    private static final String LOGGING_CONFIG_NAME = "log4j.groovy"

    static {
        def fileList = new FileNameFinder().getFileNames('./', "**/${LOGGING_CONFIG_NAME}")
        if (!fileList || fileList.size != 1) {
             throw new FileNotFoundException("Could not find unique logging config in recursive search.")
        }
        def file = new File(fileList?.get(0))
        //def config = new ConfigSlurper().parse(new File('support/scripts/log4j.groovy').toURI().toURL())
        def config = new ConfigSlurper().parse(file.toURI().toURL())
        PropertyConfigurator.configure(config.toProperties())
    }

    private def showError = { String message ->
        throw new UnsupportedOperationException(message)
    }

    private def addToTarget = { target, sourceElement ->
        target.add(sourceElement)
    }

    private def putInTarget = { target, sourceKey, sourceValue ->
        target.put(sourceKey, sourceValue)
    }

    def stepIntoJsonArray(JSONArray target, sourceElement, i, Expando expando) {
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

    def stepIntoJsonObject(JSONObject target, sourceElement, Expando expando) {
        def sourceKey = sourceElement.key
        def sourceValue = sourceElement.value

        if (target.containsKey(sourceKey) && (sourceValue instanceof JSONAware)) {
            expando.parentFunction(sourceValue, target[sourceKey], expando)
        } else {
            expando.altFunction(target, sourceKey, sourceValue)
        }
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

    def createJsonObject(String target) {
        JSONParser parser = new JSONParser()
        JSONObject json = parser.parse(target)
        return json
    }

    def logJsonObject(JSONObject object) {
        log.info(object)
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

    //	private static def checkAndUnpack={ source, target, Expando expando ->
    //		expando.completed = target
    //		expando.parentFunction = checkAndUnpack
    //		source.eachWithIndex{ sourceElement, i->
    //			if (source instanceof JSONArray && target instanceof JSONArray) {
    //				expando.altFunction = {showError(ARRAY_ERROR)}
    //				stepIntoJsonArray(source, target, sourceElement, i, expando)
    //			} else if (source instanceof JSONObject && target instanceof JSONObject) {
    //				expando.altFunction = {showError(MAP_ERROR)}
    //				stepIntoJsonObject(source, target, sourceElement, expando)
    //			} else {
    //				showError(ITERATE_ERROR)
    //			}
    //		}
    //		return expando.completed
    //	}
    //
    //	/**
    //	 * Uses the sourceEnvelope to find the inner json element/object that the envelope contains.
    //	 * @param source: source record(s) with envelope
    //	 * @param envelope: the envelope to remove from source(s)
    //	 * @return: inner json object
    //	 */
    //	static JSONObject unpackCollection(final JSONObject source, final String envelope) {
    //		def expando = new Expando()
    //		JSONObject jsonEnvelope = createJsonObject(envelope)
    //		JSONObject result = checkAndUnpack(jsonEnvelope, source, expando)
    //		return result
    //	}

    //TODO : remove dependence on hard-coding of "data.data"
    /**
     * (Alternative to slurper is to use method unpackCollection)
     * @param source full text including envelope and body.
     * TODO : At the moment this method and the alternative can find a point within text to start at for adding defaults
     * with deeperMerge. However finding the starting point is not enough. It needs to remove and remember this envelope to
     * be able to re-add it around the updated body text at the end of deeperMerge. Currently this method does not take into
     * account the added field type: JsonService, either
     * @return
     */
//	static def slurpBody(String source) {
//		def sourceSlurper = new JsonSlurper().parseText(source)
//		def sourceBody = sourceSlurper.data.data
//
//		String sourceString = JsonOutput.toJson(sourceBody)
//
//		JSONParser parser = new JSONParser()
//		def sourceJson
//		if (sourceBody instanceof List<?>) {
//			sourceJson = (JSONArray)parser.parse(sourceString);
//		} else {
//			sourceJson = (JSONObject)parser.parse(sourceString);
//		}
//
//		return sourceJson
//	}
//
//
//	/**
//	 * Calls deeperMerge for multiple json records, applying to jsonTemplate.
//	 * @param source: source json object containing multiple json records
//	 * @param target: target json template containing default values and/or required properties
//	 * @return
//	 */
//	static def addDefaultToMultiple(final JSONAware source, final String target) {
//		JSONArray resultCollection = new JSONArray()
//		source.each{ element->
//			JSONObject result = deeperMerge(element, target)
//			resultCollection.add(result)
//		}
//		return resultCollection
//	}

}