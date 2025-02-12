package fr.univlyon1.m1if.m1if13.users.dto;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

/**
 * DTO de type Link (voir doc OpenAPI).
 */
public final class LinkDto {
    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "href", isAttribute  = true)
    private final String link;

    public LinkDto(String linkId) {
        this.link = linkId;
    }

    public String getLink() {
        return link;
    }
}
