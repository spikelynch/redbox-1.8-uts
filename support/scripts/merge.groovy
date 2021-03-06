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

@GrabConfig(systemClassLoader=true)
@Grab(group = 'log4j', module = 'log4j', version = '1.2.12')
import groovy.json.JsonBuilder
import groovy.json.JsonSlurper
import groovy.util.logging.Log4j
import org.apache.log4j.PropertyConfigurator

/**
 * To run this script:
 * - navigate to support/scripts directory
 * - copy your system-config to the directory
 * - groovy merge.groovy system-config.json
 * The script will:
 * - download latest config-include files to support/scripts/config-include
 * (needed as git api has request limit per hour for anonymous access - can comment out method call once this is completed.)
 * - merge config-include files into the target 'system-config.json' supplied
 * - writes out result to support/scripts/system-config-result.json
 * Tested against groovy version: 2.3.4
 * TODO : investigate possible issue with logging dependency and config
 * (to use latest groovy, and avoid clashes, have needed to update gmaven (which is no longer supported anyway) to gmaven-plus in redbox and mint builds)
 * Solution for this (yet to test) : use log4 for script logging so no clashes on classpath with slf4j and logback.
 * TODO : update pom so support/scripts (if not already) correctly copies script and logging support needed in installation.
 * TODO: 'redbox.identity' should remapped into 'identity'
 * TODO: 'RIF-CS Group' should be remapped into 'RIF_CSGroup'
 * @version
 * @author <a href="matt@redboxresearchdata.com.au">Matt Mulholland</a>
 */


def setUpLoggingConfig = {
    def fileList = new FileNameFinder().getFileNames('./', "**/log4j.groovy")
    if (!fileList || fileList.size != 1) {
        throw new FileNotFoundException("Could not find unique logging config in recursive search.")
    }
    def file = new File(fileList?.get(0))
    def config = new ConfigSlurper().parse(file.toURI().toURL())
    PropertyConfigurator.configure(config.toProperties())
}

setUpLoggingConfig()


def downloadUrl = "https://api.github.com/repos/redbox-mint/redbox-build-distro/contents/src/main/config/home/config-include"
def target
def log = new Logger()

def getInputTargetText = {
    def parentDir = new File(getClass().protectionDomain.codeSource.location.path).parent
    def fileList = new FileNameFinder().getFileNames(parentDir, "**/${it}")
    if (!fileList || fileList.size != 1) {
        throw new FileNotFoundException("Could not find unique file matching pattern, **/${it}, in recursive search of ${parentDir}")
    }
    return new File(fileList.get(0)).text
}

switch (args.size()) {
    case 2:
        downloadUrl = args[1]
// allow drop-through to assign next arg.
    case 1:
        target = getInputTargetText()
        if (!target) {
            throw new IOException("Could not get text from file named on command line.")
        }
        break
    case 0:
        try {
            target = getInputTargetText('system-config.json') ?: "{}"
        } catch (FileNotFoundException e) {
            target = "{}"
        }
        log.info("Using default arguments for script:...")
        log.info("...downloadUrl : ${downloadUrl}")
        log.info("...target : ${target}")
        break
    default:
        throw new IllegalArgumentException("Wrong number of arguments passed to script. Usage: groovy merge.groovy [ <name of json config file> [<download url>] ])")
        break
}


DownloadGithubConfig downloadConfig = new DownloadGithubConfig(downloadUrl)

//to avoid api-github limit being reached, comment-out this method once files have been downloaded.
//downloadConfig.downloadFiles()

//TODO : target is always clobbered - change this as existing config should overwrite downloaded versions
downloadConfig.configDir.eachFileRecurse { File file ->
    log.debug("adding file : " + file)
    target = new MergeConfig().deeperMerge(file.text, target)
}
File configResult = new File("system-config-result.json")
configResult.text = target

@Log4j
class Logger {
    def info = {
        log.info(it)
    }

    def debug = {
        log.debug(it)
    }
}

@Log4j
/**
 * With a github api url to instantiate class, this uses the api, no-authentication to recursively download files contained.
 * The files are downloaded to the current script location under a folder created using the last '/'-separated path suffix in url name.
 * This ensures there is a persisted record of the download, as this is a non-authenticated use of the github-api, which has a download limit
 * rule per hour (or in other words, once files are downloaded, comment out the caller).
 */
class DownloadGithubConfig {
    final String configUrl
    final File configDir

    private DownloadGithubConfig() {
        throw new UnsupportedOperationException("Cannot instantiate a no-args class. Usage: DownloadConfigFromGitHub(<<downloadUrl>>)")
    }

    DownloadGithubConfig(String url) {
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
        new JsonSlurper().parseText(it.toURI().toURL().getText())
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

@Log4j
class MergeConfig {
    /**
     * This is a deep merge function for 2 json documents. The source is used to add data to the target.
     * Maps and Lists are checked to allow nested data to be checked and updated, without performing a shallow clobber.
     *
     * @param src the json object used to get new data
     * @param tgt the target of the merge. New data will be added.
     * @return merged target
     */

    private static final String ITERATE_ERROR = "The compared objects do not contain compatible types"

    String deeperMerge(final String source, final String target) {
        def jsonSource = new JsonSlurper().parseText(source)
        def jsonTarget = new JsonSlurper().parseText(target)
        def result = checkAndMerge(jsonSource, jsonTarget)

        def formattedResult = new JsonBuilder(result).toPrettyString()
        log.debug(formattedResult)
        return formattedResult
    }

    def checkAndMerge = { source, target ->
        if ([List, Map].any { source in it }) {
            source.each { sourceElement ->
                log.debug("Inspecting...")
                log.debug("...source: " + new JsonBuilder(source))
                log.debug("...target: " + new JsonBuilder(target))
                if (target in List) {
                    stepIntoList(target, sourceElement)
                } else if ([source, target].every { it in Map }) {
                    stepIntoMap(target, sourceElement)
                } else {
                    showError(ITERATE_ERROR)
                }
            }
        }
        return target
    }

    private def showError = { String message ->
        throw new UnsupportedOperationException(message)
    }

    /**
     *  Updates list target if there is a contained list or map not in the target.
     *  Does not add new elements from source if it has array in common with target.
     *  Will continue recursion into contained lists or maps in common with source.
     *  //TODO : tidy-up this method.
     *
     * @param target : the array to update
     * @param sourceElement : the element, from the update source, to add
     */
    private def stepIntoList(List target, sourceElement) {

        // if source is deeper, check if target has same list or map
        def sourceDeepType = [List, Map].find { sourceElement in it }
        def nextDeepTarget
        if (sourceDeepType) {
            nextDeepTarget = target.find { it in sourceDeepType }
            if (nextDeepTarget) {
                checkAndMerge(sourceElement, nextDeepTarget)
            } else {
                target.add(sourceElement)
            }
        }
    }

    /**
     * All map.entries that are not in target are added from source.
     * If target has map.entry in common, the target value remains.
     * @param target : the Map to update
     * @param sourceElement : the element, from the update source, to put
     */
    private def stepIntoMap(Map target, sourceElement) {
        def sourceKey = sourceElement.key
        def sourceValue = sourceElement.value

        if (!target.containsKey(sourceKey)) {
            target.put(sourceKey, sourceValue)
        } else {
            checkAndMerge(sourceValue, target[sourceKey])
        }
    }

}