"""
Build an eXeLearning .elp (legacy zip with content.xml) from a simple JSON spec.

The spec is intentionally small and content-focused; this module turns it into a
valid eXeLearning project that the eXeLearning CLI can export (see scripts/exe/README).

Spec shape (JSON):
{
  "id": "2026-07-06-...", "title": "...", "subtitle": "...",
  "author": "...", "lang": "es", "theme": "base",
  "license": "creative commons: cc by-sa 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
  "footer": "<p>...</p>",
  "pages": [
    {"title": "Inicio", "icon": "book", "blocks": [
       {"title": "Bienvenida", "icon": "book", "md": "## ...\n\n- ..."}
    ]}
  ]
}

Each block becomes a Markdown iDevice (markdown-text): the Markdown source is
stored verbatim (editable in eXe) and pre-rendered to HTML (used on export).
"""

import html as _html
import json
import os
import shutil
import sys
import zipfile

import markdown as _markdown


def md_to_html(src: str) -> str:
    """Render Markdown to HTML (close to eXe's Showdown output for our content)."""
    return _markdown.markdown(
        src or "",
        extensions=["extra", "sane_lists", "nl2br"],
        output_format="html5",
    )


def xesc(s: str) -> str:
    """XML-escape a value that will live inside an element (e.g. <htmlView>)."""
    return _html.escape(s, quote=False)


_counter = 0


def nid() -> str:
    global _counter
    _counter += 1
    return f"SP{_counter:08d}"


def markdown_idevice(idv_id: str, md_source: str) -> str:
    rendered = md_to_html(md_source)
    inner = (
        '<div class="exe-markdown-template">'
        '<div class="markdownTextIdeviceContent">'
        '<div class="exe-markdown-activity">'
        f'<div class="markdown-body">{rendered}</div>'
        '</div></div></div>'
    )
    json_props = {
        "ideviceId": idv_id,
        "markdownTextarea": md_source,
        "markdownTextareaHtml": rendered,
        "markdownInfoDurationInput": "",
        "markdownInfoDurationTextInput": "Duración:",
        "markdownInfoParticipantsInput": "",
        "markdownInfoParticipantsTextInput": "Agrupar:",
        "markdownFeedbackInput": "Mostrar comentarios",
        "markdownFeedbackTextarea": "",
        "markdownFeedbackTextareaHtml": "",
    }
    json_str = xesc(json.dumps(json_props, ensure_ascii=False))
    return (
        "<odeComponent>"
        f"<odePageId>{{page}}</odePageId>"
        f"<odeBlockId>{{block}}</odeBlockId>"
        f"<odeIdeviceId>{idv_id}</odeIdeviceId>"
        "<odeIdeviceTypeName>markdown-text</odeIdeviceTypeName>"
        f"<htmlView>{xesc(inner)}</htmlView>"
        f"<jsonProperties>{json_str}</jsonProperties>"
        "<odeComponentsOrder>1</odeComponentsOrder>"
        "<odeComponentsProperties>"
        "<odeComponentsProperty><key>identifier</key><value/></odeComponentsProperty>"
        "<odeComponentsProperty><key>visibility</key><value>true</value></odeComponentsProperty>"
        "<odeComponentsProperty><key>cssClass</key><value/></odeComponentsProperty>"
        "</odeComponentsProperties>"
        "</odeComponent>"
    )


def block(page_id: str, block_id: str, order: int, component_xml: str, icon: str, block_name: str) -> str:
    icon_tag = f"<iconName>{xesc(icon)}</iconName>" if icon else "<iconName/>"
    component_xml = component_xml.replace("{page}", page_id).replace("{block}", block_id)
    return (
        "<odePagStructure>"
        f"<odePageId>{page_id}</odePageId>"
        f"<odeBlockId>{block_id}</odeBlockId>"
        f"<blockName>{xesc(block_name)}</blockName>"
        f"{icon_tag}"
        f"<odePagStructureOrder>{order}</odePagStructureOrder>"
        "<odePagStructureProperties>"
        "<odePagStructureProperty><key>identifier</key><value/></odePagStructureProperty>"
        "<odePagStructureProperty><key>visibility</key><value>true</value></odePagStructureProperty>"
        "<odePagStructureProperty><key>allowToggle</key><value>true</value></odePagStructureProperty>"
        "<odePagStructureProperty><key>minimized</key><value>false</value></odePagStructureProperty>"
        "<odePagStructureProperty><key>cssClass</key><value/></odePagStructureProperty>"
        "</odePagStructureProperties>"
        f"<odeComponents>{component_xml}</odeComponents>"
        "</odePagStructure>"
    )


def nav_page(page_id: str, parent_id: str, name: str, order: int, blocks_xml: str) -> str:
    return (
        "<odeNavStructure>"
        f"<odePageId>{page_id}</odePageId>"
        f"<odeParentPageId>{parent_id}</odeParentPageId>"
        f"<pageName>{xesc(name)}</pageName>"
        f"<odeNavStructureOrder>{order}</odeNavStructureOrder>"
        "<odeNavStructureProperties>"
        "<odeNavStructureProperty><key>visibility</key><value>true</value></odeNavStructureProperty>"
        f"<odeNavStructureProperty><key>titleNode</key><value>{xesc(name)}</value></odeNavStructureProperty>"
        "<odeNavStructureProperty><key>titleHtml</key><value/></odeNavStructureProperty>"
        f"<odeNavStructureProperty><key>titlePage</key><value>{xesc(name)}</value></odeNavStructureProperty>"
        "<odeNavStructureProperty><key>description</key><value/></odeNavStructureProperty>"
        "</odeNavStructureProperties>"
        f"<odePagStructures>{blocks_xml}</odePagStructures>"
        "</odeNavStructure>"
    )


def build_content_xml(spec: dict) -> str:
    theme = spec.get("theme", "base")
    pages_xml = []
    for p_order, page in enumerate(spec["pages"], start=1):
        pid = nid()
        blocks_xml = []
        for b_order, blk in enumerate(page.get("blocks", []), start=1):
            bid = nid()
            comp = markdown_idevice(nid(), blk["md"])
            blocks_xml.append(
                block(pid, bid, b_order, comp,
                      icon=blk.get("icon", "info"),
                      block_name=blk.get("title", page["title"]))
            )
        pages_xml.append(nav_page(pid, "", page["title"], p_order, "".join(blocks_xml)))

    footer = spec.get("footer", "")
    return f"""<?xml version="1.0" encoding="utf-8"?>
<ode>
<userPreferences><userPreference><key>theme</key><value>{xesc(theme)}</value></userPreference></userPreferences>
<odeResources>
  <odeResource><key>odeVersionName</key><value>1</value></odeResource>
  <odeResource><key>isDownload</key><value>true</value></odeResource>
</odeResources>
<odeProperties>
  <odeProperty><key>pp_title</key><value>{xesc(spec["title"])}</value></odeProperty>
  <odeProperty><key>pp_lang</key><value>{xesc(spec.get("lang", "es"))}</value></odeProperty>
  <odeProperty><key>pp_author</key><value>{xesc(spec.get("author", ""))}</value></odeProperty>
  <odeProperty><key>pp_description</key><value>{xesc(spec.get("subtitle", ""))}</value></odeProperty>
  <odeProperty><key>pp_license</key><value>{xesc(spec.get("license", ""))}</value></odeProperty>
  <odeProperty><key>pp_licenseUrl</key><value>{xesc(spec.get("licenseUrl", ""))}</value></odeProperty>
  <odeProperty><key>pp_theme</key><value>{xesc(theme)}</value></odeProperty>
  <odeProperty><key>pp_addExeLink</key><value>true</value></odeProperty>
  <odeProperty><key>pp_addPagination</key><value>true</value></odeProperty>
  <odeProperty><key>pp_addSearchBox</key><value>true</value></odeProperty>
  <odeProperty><key>pp_addAccessibilityToolbar</key><value>false</value></odeProperty>
  <odeProperty><key>pp_footer</key><value><![CDATA[{footer}]]></value></odeProperty>
  <odeProperty><key>exportSource</key><value>true</value></odeProperty>
</odeProperties>
<odeNavStructures>
{''.join(pages_xml)}
</odeNavStructures>
</ode>
"""


def write_elp(spec: dict, out_path: str) -> str:
    """Write a .elp (zip with content.xml) from the spec. Returns out_path."""
    global _counter
    _counter = 0
    src_dir = out_path + "-src"
    if os.path.isdir(src_dir):
        shutil.rmtree(src_dir)
    os.makedirs(src_dir)
    with open(os.path.join(src_dir, "content.xml"), "w", encoding="utf-8") as f:
        f.write(build_content_xml(spec))
    if os.path.exists(out_path):
        os.remove(out_path)
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
        for dp, _, files in os.walk(src_dir):
            for fn in files:
                ap = os.path.join(dp, fn)
                z.write(ap, os.path.relpath(ap, src_dir))
    shutil.rmtree(src_dir)
    return out_path


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("usage: python3 exelib.py <spec.json> <out.elp>", file=sys.stderr)
        sys.exit(1)
    with open(sys.argv[1], encoding="utf-8") as f:
        spec = json.load(f)
    write_elp(spec, sys.argv[2])
    print(f"Wrote {sys.argv[2]} ({len(spec['pages'])} pages)")
