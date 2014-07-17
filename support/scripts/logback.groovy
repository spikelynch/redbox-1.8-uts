import ch.qos.logback.classic.encoder.PatternLayoutEncoder
import ch.qos.logback.core.ConsoleAppender
import ch.qos.logback.core.rolling.FixedWindowRollingPolicy
import ch.qos.logback.core.rolling.RollingFileAppender
import ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy

import static ch.qos.logback.classic.Level.DEBUG

appender("stdout", ConsoleAppender) {
    encoder(PatternLayoutEncoder) {
        pattern = "%d{ISO8601} %-6p %-20.20c{0} %m%n"
    }
}

appender("rollingFile", RollingFileAppender) {
    file =  "logs/merge.log"
    rollingPolicy(FixedWindowRollingPolicy) {
        fileNamePattern = "merge.%i.log.zip"
        minIndex = 1
        maxIndex = 9
    }
    triggeringPolicy(SizeBasedTriggeringPolicy) {
        maxFileSize = "5MB"
    }
    encoder(PatternLayoutEncoder) {
        pattern = "%d{ISO8601} %-6p %-20.20c{0} %m%n"
    }
}

root(DEBUG, ["rollingFile", "stdout"])