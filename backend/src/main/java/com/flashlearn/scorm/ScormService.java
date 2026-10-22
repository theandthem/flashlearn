package com.flashlearn.scorm;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flashlearn.common.ResourceNotFoundException;
import com.flashlearn.deck.Deck;
import com.flashlearn.deck.DeckRepository;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Builds a SCORM 2004 (4th Edition) package for a deck: a self-contained SCO
 * (HTML/JS/CSS player with the deck data embedded) plus an imsmanifest.xml,
 * zipped in memory. The content scores client-side and reports to the LMS.
 */
@Service
public class ScormService {

    private static final String PASS_TEMPLATE_TITLE = "__TITLE__";
    private static final List<String> STATIC_SCO_FILES =
            List.of("player.js", "scorm2004.js", "styles.css");

    // Self-contained mapper — only used to serialise the deck DTO for the SCO.
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final DeckRepository deckRepository;

    public ScormService(DeckRepository deckRepository) {
        this.deckRepository = deckRepository;
    }

    public record ScormPackage(String filename, byte[] content) {
    }

    @Transactional(readOnly = true)
    public ScormPackage export(UUID deckId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + deckId));

        String deckJson = toJson(ScormDeckDto.from(deck));
        String indexHtml = template("index.html")
                .replace(PASS_TEMPLATE_TITLE, htmlEscape(deck.getTitle()))
                // Guard against </script> appearing inside the embedded JSON.
                .replace("__DECK_DATA__", deckJson.replace("</", "<\\/"));

        String manifest = template("imsmanifest.xml")
                .replace("__ID__", "MANIFEST-" + deck.getId())
                .replace(PASS_TEMPLATE_TITLE, xmlEscape(deck.getTitle()));

        byte[] zip = zip(indexHtml, manifest);
        return new ScormPackage(filenameFor(deck.getTitle()), zip);
    }

    private byte[] zip(String indexHtml, String manifest) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(out)) {
            writeEntry(zos, "imsmanifest.xml", manifest);
            writeEntry(zos, "index.html", indexHtml);
            for (String name : STATIC_SCO_FILES) {
                writeEntry(zos, name, template(name));
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to build SCORM package", e);
        }
        return out.toByteArray();
    }

    private void writeEntry(ZipOutputStream zos, String name, String content) throws IOException {
        zos.putNextEntry(new ZipEntry(name));
        zos.write(content.getBytes(StandardCharsets.UTF_8));
        zos.closeEntry();
    }

    private String template(String name) {
        try {
            return new ClassPathResource("scorm/" + name).getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Missing SCORM template: " + name, e);
        }
    }

    private String toJson(ScormDeckDto dto) {
        try {
            return OBJECT_MAPPER.writeValueAsString(dto);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialise deck for SCORM", e);
        }
    }

    private String filenameFor(String title) {
        String slug = title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return (slug.isBlank() ? "deck" : slug) + "-scorm.zip";
    }

    private static String htmlEscape(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private static String xmlEscape(String value) {
        return htmlEscape(value).replace("'", "&apos;");
    }
}
