package tv.oriel.launcher

import java.io.File
import javax.xml.parsers.DocumentBuilderFactory
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.w3c.dom.Element
import tv.oriel.launcher.ui.theme.OrielTokens

class TranslationsTest {
    private val res = File("src/main/res")
    private val placeholder = Regex("%\\d+\\$[sd]")

    /** The translatable strings in one values folder, by name. */
    private fun strings(folder: String): Map<String, String> {
        val nodes = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(File(res, "$folder/strings.xml")).getElementsByTagName("string")
        return (0 until nodes.length).map { nodes.item(it) as Element }
            .filter { it.getAttribute("translatable") != "false" }
            .associate { it.getAttribute("name") to it.textContent }
    }

    private val source = strings("values")
    private val languages = res.listFiles { file -> file.name.startsWith("values-") && File(file, "strings.xml").exists() }!!.map { it.name }.sorted()

    @Test
    fun `every translation has exactly the source strings`() {
        assertTrue("expected the first set of six translations", languages.size >= 6)
        for (language in languages) assertEquals("$language strings", source.keys, strings(language).keys)
    }

    @Test
    fun `placeholders survive translation`() {
        for (language in languages) {
            for ((name, text) in strings(language)) {
                val expected = placeholder.findAll(source.getValue(name)).map { it.value }.toSet()
                assertEquals("$language/$name placeholders", expected, placeholder.findAll(text).map { it.value }.toSet())
            }
        }
    }

    @Test
    fun `every translation says whether a native speaker has reviewed it, and is listed in the docs`() {
        val docs = File("../docs/translations.md").readText()
        for (language in languages) {
            val text = File(res, "$language/strings.xml").readText()
            assertTrue("$language has no review status", "needs review by a native speaker" in text || "Reviewed by" in text)
            assertTrue("$language isn't listed in docs/translations.md", "`$language`" in docs)
        }
    }

    @Test
    fun `every design token has a translatable name`() {
        val names = OrielTokens.Accent.All.map { "accent_${it.id}" } +
            OrielTokens.Wallpaper.All.map { "wallpaper_${it.id}" } +
            OrielTokens.ThemePack.All.flatMap { listOf("pack_${it.id}", "pack_${it.id}_description") }
        for (name in names) assertTrue("$name is missing from values/strings.xml", name in source)
    }
}
