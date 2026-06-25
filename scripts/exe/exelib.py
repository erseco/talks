"""
Build an eXeLearning .elp (legacy zip with content.xml) from a simple JSON spec.

Spec shape (JSON):
{
  "id": "...", "title": "...", "subtitle": "...",
  "author": "...", "lang": "es", "theme": "base",
  "license": "...", "licenseUrl": "...", "footer": "<p>...</p>",
  "pages": [
    { "title": "Inicio", "icon": "book", "blocks": [
        { "title": "Texto", "icon": "info", "md": "## ...\n- ..." },
        { "image": "/abs/path/slide-01.png", "caption": "", "icon": "gallery" },
        { "md": "<notes>", "teacher": true, "title": "Notas del ponente", "icon": "info" }
    ] }
  ]
}

Blocks: `md` → a Markdown iDevice (markdown-text); `image` → a Text iDevice with
an embedded image (copied into the unit's media library). `teacher: true` marks
the block teacher-only (shown only in eXeLearning's teacher/docente mode).
"""

import html as _html
import json
import os
import shutil
import sys
import zipfile

import markdown as _markdown


def md_to_html(src):
    return _markdown.markdown(src or "", extensions=["extra", "sane_lists", "nl2br"], output_format="html5")


def xesc(s):
    return _html.escape(s, quote=False)


_counter = 0
# ideviceId -> absolute source path of an image to copy into content/resources/.
IMAGE_BINDINGS = {}


def nid():
    global _counter
    _counter += 1
    return f"SP{_counter:08d}"


def _component(idv_id, type_name, html_view, json_props, teacher_only=False):
    json_str = xesc(json.dumps(json_props, ensure_ascii=False))
    teacher_prop = (
        "<odeComponentsProperty><key>teacherOnly</key><value>true</value></odeComponentsProperty>"
        if teacher_only else ""
    )
    return (
        "<odeComponent>"
        "<odePageId>{page}</odePageId>"
        "<odeBlockId>{block}</odeBlockId>"
        f"<odeIdeviceId>{idv_id}</odeIdeviceId>"
        f"<odeIdeviceTypeName>{type_name}</odeIdeviceTypeName>"
        f"<htmlView>{xesc(html_view)}</htmlView>"
        f"<jsonProperties>{json_str}</jsonProperties>"
        "<odeComponentsOrder>1</odeComponentsOrder>"
        "<odeComponentsProperties>"
        "<odeComponentsProperty><key>identifier</key><value/></odeComponentsProperty>"
        "<odeComponentsProperty><key>visibility</key><value>true</value></odeComponentsProperty>"
        "<odeComponentsProperty><key>cssClass</key><value/></odeComponentsProperty>"
        f"{teacher_prop}"
        "</odeComponentsProperties>"
        "</odeComponent>"
    )


def markdown_idevice(idv_id, md_source, teacher_only=False):
    rendered = md_to_html(md_source)
    inner = (
        '<div class="exe-markdown-template"><div class="markdownTextIdeviceContent">'
        f'<div class="exe-markdown-activity"><div class="markdown-body">{rendered}</div></div>'
        '</div></div>'
    )
    props = {
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
    return _component(idv_id, "markdown-text", inner, props, teacher_only)


def image_idevice(idv_id, img_basename, caption="", teacher_only=False):
    # eXeLearning registers the image in the media library when it lives under a
    # folder named after the owning iDevice id and is referenced via context_path.
    cap = xesc(caption)
    img_html = (
        f'<p style="text-align:center;margin:0;">'
        f'<img src="{{{{context_path}}}}/{idv_id}/{img_basename}" alt="{cap}" '
        f'style="max-width:100%;height:auto;display:block;margin:0 auto;" /></p>'
    )
    if caption:
        img_html += f'<p style="text-align:center;font-size:.85em;color:#555;margin:.4em 0 0;">{cap}</p>'
    inner = (
        '<div class="exe-text-template"><div class="textIdeviceContent">'
        f'<div class="exe-text-activity"><div>{img_html}<p class="clearfix"> </p></div></div>'
        '</div></div>'
    )
    props = {
        "ideviceId": idv_id,
        "textInfoDurationInput": "",
        "textInfoDurationTextInput": "Duración:",
        "textInfoParticipantsInput": "",
        "textInfoParticipantsTextInput": "Agrupar:",
        "textTextarea": img_html,
        "textFeedbackInput": "Mostrar comentarios",
        "textFeedbackTextarea": "",
    }
    return _component(idv_id, "text", inner, props, teacher_only)


def block(page_id, block_id, order, component_xml, icon, block_name):
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


def nav_page(page_id, name, order, blocks_xml):
    return (
        "<odeNavStructure>"
        f"<odePageId>{page_id}</odePageId>"
        "<odeParentPageId></odeParentPageId>"
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


def build_content_xml(spec, spec_dir):
    theme = spec.get("theme", "base")
    pages_xml = []
    for p_order, page in enumerate(spec["pages"], start=1):
        pid = nid()
        blocks_xml = []
        for b_order, blk in enumerate(page.get("blocks", []), start=1):
            bid = nid()
            idv = nid()
            teacher = bool(blk.get("teacher"))
            if blk.get("image"):
                src = blk["image"]
                if not os.path.isabs(src):
                    src = os.path.join(spec_dir, src)
                base = os.path.basename(src)
                IMAGE_BINDINGS[idv] = src
                comp = image_idevice(idv, base, blk.get("caption", ""), teacher)
            else:
                comp = markdown_idevice(idv, blk.get("md", ""), teacher)
            blocks_xml.append(
                block(pid, bid, b_order, comp,
                      icon=blk.get("icon", "info"),
                      block_name=blk.get("title", page["title"]))
            )
        pages_xml.append(nav_page(pid, page["title"], p_order, "".join(blocks_xml)))

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


def write_elp(spec, out_path, spec_dir="."):
    global _counter, IMAGE_BINDINGS
    _counter = 0
    IMAGE_BINDINGS = {}
    src_dir = out_path + "-src"
    if os.path.isdir(src_dir):
        shutil.rmtree(src_dir)
    os.makedirs(src_dir)

    content = build_content_xml(spec, spec_dir)
    with open(os.path.join(src_dir, "content.xml"), "w", encoding="utf-8") as f:
        f.write(content)

    for idv, src in IMAGE_BINDINGS.items():
        if not os.path.exists(src):
            print(f"WARN: missing image {src}", file=sys.stderr)
            continue
        dst = os.path.join(src_dir, "content", "resources", idv)
        os.makedirs(dst, exist_ok=True)
        shutil.copy(src, os.path.join(dst, os.path.basename(src)))

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
    write_elp(spec, sys.argv[2], spec_dir=os.path.dirname(os.path.abspath(sys.argv[1])))
    print(f"Wrote {sys.argv[2]} ({len(spec['pages'])} pages)")
