"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, FileText, CheckSquare, ArrowLeft, Lock, FileSignature, CheckCircle2 } from "lucide-react";

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'consent'>('terms');

  return (
    <div className="min-h-screen bg-surface text-foreground py-12 px-4 md:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-4xl mx-auto space-y-8 z-10 relative">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Хянах самбар руу буцах
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Хууль эрх зүй & <span className="text-accent">Нөхцөлүүд</span>
          </h1>
          <p className="text-sm text-muted">
            MyVisa.mn цахим виз мэдүүлгийн платформын үйлчилгээний нөхцөл, нууцлалын бодлого болон мэдээлэл боловсруулах зөвшөөрөл.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" /> Үйлчилгээний нөхцөл
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4" /> Нууцлалын бодлого
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'consent'
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <FileSignature className="w-4 h-4" /> Мэдээлэл боловсруулах зөвшөөрөл
          </button>
        </div>

        {/* Tab Content */}
        <div className="premium-card p-6 md:p-10 bg-surface/50 border border-line rounded-2xl shadow-xl space-y-6">
          {activeTab === 'terms' && (
            <div className="space-y-6 text-sm text-muted leading-relaxed">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" /> 1. Үйлчилгээний нөхцөл
              </h2>
              <p className="text-xs">Сүүлд шинэчлэгдсэн: 2026 оны 6 сарын 8</p>
              
              <div className="space-y-4">
                <p>
                  MyVisa.mn цахим виз мэдүүлгийн системд тавтай морилно уу. Энэхүү үйлчилгээний нөхцөл нь тус платформоор дамжуулан үйлчилгээ авахтай холбоотой үүсэх харилцааг зохицуулна.
                </p>

                <h3 className="font-bold text-foreground mt-4">1. Үйлчилгээний хамрах хүрээ</h3>
                <p>
                  MyVisa.mn нь гадаад улс руу зорчих виз мэдүүлэгчид (хувь хүн болон байгууллага)-д зориулсан визний материал бүрдүүлэх, зөвлөгөө өгөх, холбогдох Элчин сайдын яамдад зуучлан хүргэх цахим платформ юм. Виз олгох эцсийн шийдвэрийг тухайн улсын Элчин сайдын яам (ЭСЯ) гаргах бөгөөд бид шийдвэрт нөлөөлөх эрхгүй.
                </p>

                <h3 className="font-bold text-foreground mt-4">2. Дансны аюулгүй байдал</h3>
                <p>
                  Хэрэглэгч системд бүртгүүлэхдээ үнэн зөв мэдээлэл өгөх үүрэгтэй. Нэвтрэх нэр, нууц үгийн нууцлалыг хэрэглэгч өөрөө хариуцах бөгөөд таны бүртгэлээр хийгдсэн аливаа үйлдлийг таны өөрийн үйлдсэнд тооцно.
                </p>

                <h3 className="font-bold text-foreground mt-4">3. Төлбөр тооцоо ба буцаалт</h3>
                <p>
                  Визний хураамж болон платформын үйлчилгээний хураамжийг QPay цахим төлбөрийн системээр дамжуулан төлнө. Виз мэдүүлгийн ажиллагаа эхэлсэн эсвэл ЭСЯ-нд материал хүргэгдсэнээс хойш төлбөр буцаах боломжгүй.
                </p>

                <h3 className="font-bold text-foreground mt-4">4. Үйлчилгээний хязгаарлалт</h3>
                <p>
                  Хуурамч бичиг баримт бүрдүүлсэн, бусдын нэрийг ашиглан хууран мэхлэхийг оролдсон тохиолдолд үйлчилгээг шууд цуцалж, холбогдох хууль хяналтын байгууллагад мэдэгдэх эрхтэй.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 text-sm text-muted leading-relaxed">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" /> 2. Нууцлалын бодлого
              </h2>
              <p className="text-xs">Сүүлд шинэчлэгдсэн: 2026 оны 6 сарын 8</p>

              <div className="space-y-4">
                <p>
                  Хувийн мэдээлэл хамгаалах тухай хуулийн дагуу виз мэдүүлэгчийн хувийн нууцлал болон мэдээллийн аюулгүй байдлыг хангах нь манай хамгийн чухал зорилт юм.
                </p>

                <h3 className="font-bold text-foreground mt-4">1. Бидний цуглуулдаг мэдээлэл</h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Суурь мэдээлэл: Овог нэр, регистрийн дугаар, иргэний үнэмлэхийн мэдээлэл, утасны дугаар, цахим хаяг.</li>
                  <li>Санхүүгийн мэдээлэл: Нийгмийн даатгалын мэдээлэл (ХУР системээс), ажил олгогч байгууллагын нэр, сарын цалин, банкны хуулга.</li>
                  <li>Бичиг баримт: Гадаад паспортын хуулбар, цээж зураг, виз мэдүүлгийн бусад баримтууд.</li>
                </ul>

                <h3 className="font-bold text-foreground mt-4">2. Мэдээллийн хамгаалалт</h3>
                <p>
                  Таны байршуулсан бүх бичиг баримт (паспорт, зураг, хуулга) нь Supabase-ийн хувийн хадгалах сан (Private Storage Bucket)-д байрших бөгөөд зөвхөн эрх бүхий Элчин сайдын яам болон компанийн админ түр хугацаанд үүсгэсэн хамгаалалттай холбоосоор (Signed URL) хандах боломжтой байна. Мэдээллийг дамжуулахдаа SSL/TLS шифрлэлт ашигладаг.
                </p>

                <h3 className="font-bold text-foreground mt-4">3. Мэдээлэл хадгалах хугацаа</h3>
                <p>
                  Таны виз мэдүүлгийн бичиг баримтууд виз мэдүүлэгдсэнээс хойш 6 сарын дараа системээс автоматаар бүрмөсөн устгагдах болно. Мэдүүлэгч хүсвэл өөрийн бүртгэлийг хэдийд ч устгах боломжтой.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'consent' && (
            <div className="space-y-6 text-sm text-muted leading-relaxed">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-accent" /> 3. Хувийн мэдээлэл боловсруулах зөвшөөрөл
              </h2>
              <p className="text-xs">Сүүлд шинэчлэгдсэн: 2026 оны 6 сарын 8</p>

              <div className="space-y-4">
                <p>
                  Монгол Улсын Хувийн Мэдээлэл Хамгаалах Тухай Хуулийн 6 дугаар зүйлийн дагуу виз мэдүүлэгчийн хувийн мэдээллийг цуглуулах, боловсруулах, дамжуулахад энэхүү зөвшөөрлийг авч байна.
                </p>

                <div className="p-4 bg-accent/5 border border-accent/15 rounded-xl space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <CheckSquare className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground text-xs">ДАН систем болон ХУР системд нэвтрэх зөвшөөрөл</p>
                      <p className="text-xs mt-0.5">Үндэсний цахим танилт нэвтрэлтийн ДАН систем болон төрийн мэдээлэл солилцооны ХУР системээс иргэний овог нэр, регистрийн дугаар, нийгмийн даатгалын шимтгэл төлөлтийн мэдээллийг автоматаар татах.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <CheckSquare className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground text-xs">Бичиг баримт дамжуулах зөвшөөрөл</p>
                      <p className="text-xs mt-0.5">Виз мэдүүлгийн зорилгоор таны гаргасан гадаад паспорт, цээж зураг, банкны хуулга зэрэг хувийн мэдээллийг сонгосон Элчин сайдын яамны консулын хэлтэст дамжуулах.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <CheckSquare className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground text-xs">Байгууллагын ажилтны баталгаажуулалт</p>
                      <p className="text-xs mt-0.5">Байгууллагын ажилтны хувиар виз мэдүүлж байгаа бол тухайн байгууллагын ажил олгогч таны ажилтны мэдээлэлд хандаж баталгаажуулах.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center text-xs text-emerald-400 font-bold bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                  <CheckCircle2 className="w-4 h-4" /> Та өөрийн ДАН системээр нэвтрэн виз мэдүүлэх товч дарснаар дээрх нөхцөлийг зөвшөөрсөнд тооцно.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
