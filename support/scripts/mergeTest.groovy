
/**
 * @version
 * @author <a href="matt@redboxresearchdata.com.au">Matt Mulholland</a>
 */


def test1 = "{\n" +
        "  \"array\": [\n" +
        "    3,\n" +
        "    2,\n" +
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
        "  \"boolean\": false,\n" +
        "  \"boolean\": true,\n" +
        "  \"null\": null,\n" +
        "  \"number\": 456,\n" +
        "  \"object\": {\n" +
        "    \"a\": \"a\",\n" +
        "    \"c\": \"c\",\n" +
        "    \"e\": \"e\",\n" +
        "    \"somethingelse\" : {\n" +
        "      \"blah\" : \"test2\"\n" +
        "    }\n" +
        "  },\n" +
        "  \"string\": \"Goodbye World!\"\n" +
        "}"

final String FILE_PATTERN = "**/merge.groovy"
def fileList = new FileNameFinder().getFileNames('./', FILE_PATTERN)
if (!fileList || fileList.size != 1) {
    throw new FileNotFoundException("Could not find unique file matching pattern, ${FILE_PATTERN}, in recursive search.")
}
def file = new File(fileList.get(0))

GroovyShell shell = new GroovyShell()
def mergeTest = shell.run(file, [test1, test2])