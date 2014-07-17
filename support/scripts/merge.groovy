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
@Grab(group = 'com.googlecode.json-simple', module = 'json-simple', version = '1.1')
import groovy.json.JsonSlurper
import groovy.util.logging.Slf4j
import org.json.simple.JSONArray
import org.json.simple.JSONAware
import org.json.simple.JSONObject
import org.json.simple.parser.JSONParser

/**
 * Tested against groovy version: 2.3.4
 * @version
 * @author <a href="matt@redboxresearchdata.com.au">Matt Mulholland</a>
 */
def downloadUrl = args.get"https://api.github.com/repos/redbox-mint/redbox-build-distro/contents/src/main/config/home/config-include"
def target = "{}"

switch (args.size()) {
    case 2:
        target = args[1]
        // allow drop-through to assign next arg.
    case 1:
        downloadUrl = args[0]
        break
    case 0:
        log.info("Using default arguments for script:...")
        log.info("...downloadUrl : ${downloadUrl}")
        log.info("...target : ${target}")
        break
    default:
        throw new IllegalAccessException("Wrong number of arguments passed to script. Usage: groovy merge.groovy [<downloadUrl [<source system-config.json>]])")
        break
}


DownloadConfigFromGithub downloadConfig = new DownloadConfigFromGithub(downloadUrl)

//to avoid api-github limit being reached, comment-out this method once files have been downloaded.
downloadConfig.downloadFiles()

//TODO : target is always clobbered - change this as existing config should overwrite downloaded versions
downloadConfig.configDir.eachFileRecurse { File file ->
    target = new MergeConfig().deeperMerge(file.text, target)
}

@Slf4j
class DownloadConfigFromGithub {
    final String configUrl
    final File configDir

    private DownloadConfigFromGithub() {
        throw new UnsupportedOperationException("Cannot instantiate a no-args class. Usage: DownloadConfigFromGitHub(<<downloadUrl>>)")
    }

    DownloadConfigFromGithub(String url) {
        this.configUrl = url
        this.configDir = getDownloadDir(this.configUrl)
    }

    private def getDownloadDir = {
        def dir
        def dirName = it.split("/")[-1]
        dir = new File(dirName)
        dir.mkdir()
        return dir
    }

    def slurpUrl = {
        new JsonSlurper().parse(new BufferedReader(new InputStreamReader(new URL(it).openStream())))
    }

    def downloadFile = { File dir, config ->
        File file = new File(dir, config.name)
        file.text = (config.url).toURI().toURL().getText(requestProperties: [Accept: "application/vnd.github.v3.raw"])
        log.debug("created file: ${file}")
        log.debug("file content: ${file.text}")
    }

    def downloadFiles = {
        if (this.configUrl?.trim() && this.configDir) {
            def dirs = [this.configUrl]
            while (dirs) {
                slurpUrl(dirs.pop()).each {
                    switch (it.type) {
                        case 'file':
                            downloadFile(this.configDir, it)
                            break
                        case 'dir':
                            dirs << it.url
                            break
                        default:
                            log.warn("Unknown github download type: ${it.type}")
                            break
                    }
                }
            }
        }
    }
}

@Slf4j
class MergeConfig {
    private static final String ITERATE_ERROR = "The compared objects do not contain compatible types"

    /**
     * This is a deep merge function for 2 json documents. The source is used to add data to the target.
     * JSONObjects and JSONArrays are checked to allow nested data to be checked and updated, without performing a shallow clobber.
     * TODO: deprecated since upgrade of groovy version: update with JsonSlurper
     *
     * @param src the json object used to get new data
     * @param tgt the target of the merge. New data will be added.
     * @return merged target
     */
    String deeperMerge(final String source, final String template) {
        def expando = new Expando()
        JSONObject jsonSource = createJsonObject(source)
        JSONObject jsonTemplate = createJsonObject(template)
        JSONObject target = checkAndMerge(jsonSource, jsonTemplate, expando)
        log.debug(target.toJSONString())
        return target.toJSONString()
    }

    def logObject(JSONObject object) {
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
                expando.updateFunction = addToTarget
                stepIntoJsonArray(target, sourceElement, i, expando)
            } else if (source instanceof JSONObject && target instanceof JSONObject) {
                expando.updateFunction = putInTarget
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

    /**
     *  Updates json array target. If:
     *  <ul>
     *  <li> we have reached the limit of the target array, add it to target </li>
     *  <li> not: </li>
     *  <ul>
     *    <li> if JSONAware: will continue recursion </li>
     *    <li> not: and element is new, adds to array </li>
     *    </ul>
     *    </ul>
     *  This behaviour can be changed to simply clobber one array with another array in {@link #checkAndMerge(source, target, expando checkAndMerge } method.
            *
            * @param target : the JsonArray to update
            * @param sourceElement : the element, from the update source, to add
            * @param i : the index, from the update source, to add
            * @param expando : Expando which holds the calling function and the updateFunction
     */
    private def stepIntoJsonArray(JSONArray target, sourceElement, i, Expando expando) {
        if (i < target.size()) {
            if (sourceElement instanceof JSONAware) {
                expando.parentFunction(sourceElement, target.get(i), expando)
            } else if (!target.contains(sourceElement)) {
                expando.updateFunction(target, sourceElement)
            }
        } else {
            expando.updateFunction(target, sourceElement)
        }
    }

    private def stepIntoJsonObject(JSONObject target, sourceElement, Expando expando) {
        def sourceKey = sourceElement.key
        def sourceValue = sourceElement.value

        if (target.containsKey(sourceKey) && (sourceValue instanceof JSONAware)) {
            expando.parentFunction(sourceValue, target[sourceKey], expando)
        } else {
            expando.updateFunction(target, sourceKey, sourceValue)
        }
    }
}